import AppTrackingTransparency
import GoogleMobileAds
import UIKit
import UserMessagingPlatform
import WebKit

/// Google AdMob (interstitial + rewarded video) for the web games, with Google's consent form (UMP) and Apple's ATT prompt.
/// Only the targets that show ads compile this file (ios/Ads, linked with the GoogleMobileAds + UMP packages, flag -DADS).
///
/// The page calls `window.webkit.messageHandlers.ads.postMessage({op})`, which returns a Promise (never rejected):
///   {op:'init'}         -> true when ads can be requested. First call: UMP consent (update + form if required),
///                          then the ATT prompt (only if UMP allows ads), then the SDK start, then one ad of each kind is preloaded.
///   {op:'interstitial'} -> true if an interstitial was shown (resolves when it is closed), false if none was ready
///   {op:'rewarded'}     -> true ONLY if the player earned the reward (watched to the end), false otherwise
///   {op:'consentForm'}  -> reopens Google's privacy options form ("Ad choices" in the settings); true if a form was shown
///   {op:'status'}       -> {test, started, canRequestAds, interstitialReady, rewardedReady, privacyOptions, att}
///
/// Ad units: Info.plist key GADUseTestAds = $(ADS_TEST) (project.yml). ADS_TEST=1 (default) → Google's public TEST units,
/// whatever the configuration (Debug, TestFlight). Only ADS_TEST=0 in a Release build uses the real units of the target
/// (GADInterstitialUnit / GADRewardedUnit). A Debug build always uses the test units.
final class NativeAds: NSObject, WKScriptMessageHandlerWithReply, FullScreenContentDelegate {
    static let testInterstitial = "ca-app-pub-3940256099942544/4411468910"
    static let testRewarded = "ca-app-pub-3940256099942544/1712485313"

    weak var webView: WKWebView?
    let testMode: Bool
    private let interstitialUnit: String
    private let rewardedUnit: String

    private var startTask: Task<Bool, Never>?
    private var started = false
    private var interstitial: InterstitialAd?
    private var rewarded: RewardedAd?
    private var loadingInterstitial = false
    private var loadingRewarded = false
    private var showing = false
    private var dismissed: CheckedContinuation<Void, Never>?

    override init() {
        let info = Bundle.main.infoDictionary ?? [:]
        #if DEBUG
        let debug = true
        #else
        let debug = false
        #endif
        let flag = (info["GADUseTestAds"] as? String ?? "1").trimmingCharacters(in: .whitespaces)
        testMode = debug || flag != "0"
        interstitialUnit = testMode ? Self.testInterstitial : (info["GADInterstitialUnit"] as? String ?? "")
        rewardedUnit = testMode ? Self.testRewarded : (info["GADRewardedUnit"] as? String ?? "")
        super.init()
    }

    // MARK: - bridge

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        let op = (message.body as? [String: Any])?["op"] as? String ?? ""
        Task { @MainActor in replyHandler(await self.run(op), nil) }
    }

    @MainActor private func run(_ op: String) async -> Any {
        switch op {
        case "init": return await start()
        case "interstitial": return await showInterstitial()
        case "rewarded": return await showRewarded()
        case "consentForm": return await privacyOptions()
        case "status": return status()
        default: return false
        }
    }

    // MARK: - first launch: UMP consent → ATT → SDK start

    @MainActor func start() async -> Bool {
        if let task = startTask { return await task.value }
        let task = Task { @MainActor in await self.startup() }
        startTask = task
        return await task.value
    }

    @MainActor private func startup() async -> Bool {
        let consent = ConsentInformation.shared
        do {
            try await consent.requestConsentInfoUpdate(with: RequestParameters())
            if let vc = topController() { try await ConsentForm.loadAndPresentIfRequired(from: vc) }
        } catch {
            print("[ads] consent:", error.localizedDescription)   // offline, form error…: keep the previous consent
        }
        guard consent.canRequestAds else { return false }
        if #available(iOS 14, *), ATTrackingManager.trackingAuthorizationStatus == .notDetermined {
            _ = await ATTrackingManager.requestTrackingAuthorization()
        }
        // Cap ad content at Teen: sensitive/mature ads excluded (privacy page says so).
        MobileAds.shared.requestConfiguration.maxAdContentRating = .teen
        _ = await MobileAds.shared.start()
        started = true
        loadInterstitial()
        loadRewarded()
        return true
    }

    // MARK: - interstitial

    private func loadInterstitial() {
        guard started, interstitial == nil, !loadingInterstitial, !interstitialUnit.isEmpty else { return }
        loadingInterstitial = true
        Task { @MainActor in
            defer { self.loadingInterstitial = false }
            do { self.interstitial = try await InterstitialAd.load(with: self.interstitialUnit, request: Request()) }
            catch { print("[ads] interstitial load:", error.localizedDescription) }
        }
    }

    @MainActor private func showInterstitial() async -> Bool {
        guard await start(), !showing else { return false }
        guard let ad = interstitial, let vc = topController() else { loadInterstitial(); return false }
        interstitial = nil
        ad.fullScreenContentDelegate = self
        showing = true
        await withCheckedContinuation { (c: CheckedContinuation<Void, Never>) in
            dismissed = c
            ad.present(from: vc)
        }
        showing = false
        loadInterstitial()
        return true
    }

    // MARK: - rewarded

    private func loadRewarded() {
        guard started, rewarded == nil, !loadingRewarded, !rewardedUnit.isEmpty else { return }
        loadingRewarded = true
        Task { @MainActor in
            defer { self.loadingRewarded = false }
            do { self.rewarded = try await RewardedAd.load(with: self.rewardedUnit, request: Request()) }
            catch { print("[ads] rewarded load:", error.localizedDescription) }
        }
    }

    @MainActor private func showRewarded() async -> Bool {
        guard await start(), !showing else { return false }
        if rewarded == nil, !loadingRewarded, !rewardedUnit.isEmpty {
            // the player asked for it: one more try right now (the preload may have failed offline)
            rewarded = try? await RewardedAd.load(with: rewardedUnit, request: Request())
        }
        guard let ad = rewarded, let vc = topController() else { loadRewarded(); return false }
        rewarded = nil
        ad.fullScreenContentDelegate = self
        showing = true
        var earned = false
        await withCheckedContinuation { (c: CheckedContinuation<Void, Never>) in
            dismissed = c
            ad.present(from: vc) { earned = true }
        }
        showing = false
        loadRewarded()
        return earned
    }

    // MARK: - FullScreenContentDelegate

    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) { finish() }

    func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        print("[ads] present:", error.localizedDescription)
        finish()
    }

    private func finish() {
        DispatchQueue.main.async {
            let c = self.dismissed
            self.dismissed = nil
            c?.resume()
        }
    }

    // MARK: - "Ad choices" in the settings

    @MainActor private func privacyOptions() async -> Bool {
        _ = await start()
        let consent = ConsentInformation.shared
        guard let vc = topController() else { return false }
        if consent.privacyOptionsRequirementStatus == .required {
            do { try await ConsentForm.presentPrivacyOptionsForm(from: vc); return true }
            catch { print("[ads] privacy form:", error.localizedDescription) }
        }
        // No Google form for this region: tracking is the only choice left, and it lives in the iOS settings.
        if #available(iOS 14, *), ATTrackingManager.trackingAuthorizationStatus != .notDetermined,
           let url = URL(string: UIApplication.openSettingsURLString) {
            await UIApplication.shared.open(url)
            return true
        }
        return false
    }

    @MainActor private func status() -> [String: Any] {
        let consent = ConsentInformation.shared
        var att = "unknown"
        if #available(iOS 14, *) {
            switch ATTrackingManager.trackingAuthorizationStatus {
            case .authorized: att = "authorized"
            case .denied: att = "denied"
            case .restricted: att = "restricted"
            case .notDetermined: att = "notDetermined"
            @unknown default: att = "unknown"
            }
        }
        return ["native": true, "test": testMode, "started": started, "canRequestAds": consent.canRequestAds,
                "interstitialReady": interstitial != nil, "rewardedReady": rewarded != nil,
                "privacyOptions": consent.privacyOptionsRequirementStatus == .required, "att": att]
    }

    // MARK: -

    @MainActor private func topController() -> UIViewController? {
        var top = webView?.window?.rootViewController
            ?? UIApplication.shared.connectedScenes.compactMap { ($0 as? UIWindowScene)?.keyWindow }.first?.rootViewController
        while let next = top?.presentedViewController { top = next }
        return top
    }
}
