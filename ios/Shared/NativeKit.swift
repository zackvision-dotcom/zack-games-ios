import StoreKit
import UIKit
import UserNotifications
import WebKit
#if canImport(FirebaseCore)
import FirebaseAnalytics
import FirebaseCore
import FirebaseCrashlytics
#endif

/// The studio's shared growth kit, the same in every game (ios/Shared): rating request, share sheet, "Our other games",
/// house ad (cross-promotion) and analytics + crash reports. The page sees `window.ZV` (installed by `script`):
///   ZV.joy(tag)        a moment of joy (record, legendary, trick shot, level won): MAY ask the native iOS rating prompt.
///                      Gated here: 3rd launch or later, 2nd joy of the session, 60 days between asks (Apple also caps 3/year).
///                      Never call it after a failure.
///   ZV.share(text)     the iOS share sheet with the text and the game's App Store link.
///   ZV.shareFile(name, dataURL, text)  the share sheet with a file the game made (a replay clip), plus the text.
///   ZV.moreGames()     the "Our other games" panel (live studio games only, never this one); a tap opens the App Store page in-app.
///   ZV.houseAd()       a full-screen card for one of our other games (cross-promotion); resolves true if shown. Games call it
///                      when no AdMob interstitial was ready, so it never replaces a paid ad.
///   ZV.event(name, p)  an analytics event (Firebase Analytics; nothing is sent when the target has no GoogleService-Info.plist).
///   ZV.remind(hhmm, title, body)  a local notification every day at HH:MM (asks the iOS permission the first time;
///                      resolves false if refused). ZV.remindOff() cancels it. Raw form: kit.postMessage({op:'remind', heure, titre, texte}).
///   ZV.others          how many of our other games are live (0: hide the "other games" button)
///   ZV.available       true in the iOS app (false on the web: the game hides its buttons).
/// Catalogue: Promo.json (bundled), refreshed from the repo so a newly released game shows up in older builds too.
final class NativeKit: NSObject, WKScriptMessageHandlerWithReply, SKStoreProductViewControllerDelegate {
    /// The page script; `others` = live studio games other than this one when the game starts (the button hides at 0).
    var script: WKUserScript { WKUserScript(source: Self.source.replacingOccurrences(of: "__OTHERS__", with: String(others.count)), injectionTime: .atDocumentStart, forMainFrameOnly: true) }
    static let source = """
        (function () {
          var k = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.kit;
          if (!k) { window.ZV = { available: false, joy: function () {}, share: function () {}, moreGames: function () {},
                                  houseAd: function () { return Promise.resolve(false); }, event: function () {}, others: 0,
                                  remind: function () { return Promise.resolve(false); }, remindOff: function () {} }; return; }
          var call = function (o) { try { return k.postMessage(o); } catch (e) { return Promise.resolve(false); } };
          window.ZV = { available: true, others: __OTHERS__,
            joy: function (tag) { return call({ op: 'joy', tag: String(tag || '') }); },
            share: function (text) { return call({ op: 'share', text: String(text || '') }); },
            shareFile: function (name, dataUrl, text) { return call({ op: 'shareFile', name: String(name || 'clip.mp4'), data: String(dataUrl || ''), text: String(text || '') }); },
            moreGames: function (lang) { return call({ op: 'more', lang: lang || document.documentElement.lang || 'fr' }); },
            houseAd: function (lang) { return call({ op: 'house', lang: lang || document.documentElement.lang || 'fr' }); },
            event: function (name, p) { return call({ op: 'event', name: String(name || ''), params: p || {} }); },
            remind: function (hhmm, title, body) { return call({ op: 'remind', heure: String(hhmm || '09:00'), titre: String(title || ''), texte: String(body || '') }); },
            remindOff: function () { return call({ op: 'remindOff' }); } };
        })();
        """

    static let catalogueURL = URL(string: "https://raw.githubusercontent.com/zackvision-dotcom/zack-games-ios/main/ios/Shared/Promo.json")!

    struct Game: Decodable { let bundle: String; let appId: String; let name: String; let fr: String; let en: String; let color: String; let live: Bool }

    weak var webView: WKWebView?
    private var games: [Game] = []
    private var joys = 0
    private let analytics: Bool
    private let defaults = UserDefaults.standard

    override init() {
        #if canImport(FirebaseCore)
        if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil {
            FirebaseApp.configure()                       // Analytics (no ad id) + Crashlytics, set up per game in the Firebase console
            analytics = true
        } else { analytics = false }
        #else
        analytics = false
        #endif
        super.init()
        defaults.set(defaults.integer(forKey: "zv.launches") + 1, forKey: "zv.launches")
        if let url = Bundle.main.url(forResource: "Promo", withExtension: "json"), let d = try? Data(contentsOf: url) { games = Self.decode(d) }
        if let d = defaults.data(forKey: "zv.promo") { let g = Self.decode(d); if !g.isEmpty { games = g } }
        URLSession.shared.dataTask(with: Self.catalogueURL) { [weak self] d, r, _ in
            guard let d, (r as? HTTPURLResponse)?.statusCode == 200 else { return }
            let g = Self.decode(d); if g.isEmpty { return }
            DispatchQueue.main.async { self?.games = g; self?.defaults.set(d, forKey: "zv.promo") }
        }.resume()
    }

    private static func decode(_ d: Data) -> [Game] { (try? JSONDecoder().decode([Game].self, from: d)) ?? [] }
    private var me: String { Bundle.main.bundleIdentifier ?? "" }
    private var others: [Game] { games.filter { $0.live && $0.bundle != me } }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        let b = message.body as? [String: Any] ?? [:]
        Task { @MainActor in
            if b["op"] as? String == "house" { self.house(b) { replyHandler($0, nil) }; return }
            if b["op"] as? String == "remind" { replyHandler(await self.remind(b), nil); return }
            replyHandler(self.run(b["op"] as? String ?? "", b), nil)
        }
    }

    @MainActor private func run(_ op: String, _ b: [String: Any]) -> Any {
        let en = (b["lang"] as? String ?? "fr").hasPrefix("en") || (b["lang"] == nil && !(Locale.preferredLanguages.first ?? "fr").hasPrefix("fr"))
        switch op {
        case "remindOff":
            UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [Self.dailyId])
            return true
        case "joy":
            joys += 1
            log("joy", ["tag": b["tag"] as? String ?? ""])
            let last = defaults.double(forKey: "zv.askedAt")
            guard joys >= 2, defaults.integer(forKey: "zv.launches") >= 3, Date().timeIntervalSince1970 - last > 60 * 86400,
                  let scene = webView?.window?.windowScene else { return false }
            defaults.set(Date().timeIntervalSince1970, forKey: "zv.askedAt")
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { SKStoreReviewController.requestReview(in: scene) }   // after the celebration
            return true
        case "share":
            let mine = games.first { $0.bundle == self.me }
            var items: [Any] = [b["text"] as? String ?? ""]
            if let mine, mine.live, let u = URL(string: "https://apps.apple.com/app/id\(mine.appId)") { items.append(u) }
            let vc = UIActivityViewController(activityItems: items, applicationActivities: nil)
            vc.popoverPresentationController?.sourceView = webView
            present(vc); log("share", [:]); return true
        case "shareFile":
            let raw = b["data"] as? String ?? ""
            guard let comma = raw.firstIndex(of: ","), let d = Data(base64Encoded: String(raw[raw.index(after: comma)...])) else { return false }
            let name = (b["name"] as? String ?? "clip.mp4").replacingOccurrences(of: "/", with: "_")
            let url = FileManager.default.temporaryDirectory.appendingPathComponent(name)
            do { try d.write(to: url, options: .atomic) } catch { return false }
            var items: [Any] = [url]
            if let t = b["text"] as? String, !t.isEmpty { items.append(t) }
            let vc = UIActivityViewController(activityItems: items, applicationActivities: nil)
            vc.popoverPresentationController?.sourceView = webView
            present(vc); log("share_clip", [:]); return true
        case "more":
            guard !others.isEmpty else { return false }
            present(PromoController(games: others, en: en, house: false) { [weak self] g in self?.openStore(g) })
            log("more_games", [:]); return true
        case "event":
            var p: [String: Any] = [:]
            for (k, v) in b["params"] as? [String: Any] ?? [:] { if v is String || v is NSNumber { p[String(k.prefix(40))] = v } }
            log(b["name"] as? String ?? "", p); return analytics
        default: return false
        }
    }

    /// One of our other games, full screen; `done(true)` when the player closes it (false: nothing to show).
    @MainActor private func house(_ b: [String: Any], done: @escaping (Bool) -> Void) {
        let seen = defaults.integer(forKey: "zv.house")
        guard !others.isEmpty, top() != nil else { done(false); return }
        let g = others[seen % others.count]; defaults.set(seen + 1, forKey: "zv.house")
        let vc = PromoController(games: [g], en: (b["lang"] as? String ?? "fr").hasPrefix("en"), house: true) { [weak self] g in self?.openStore(g) }
        vc.onClose = { done(true) }
        present(vc); log("house_ad", ["game": g.bundle])
    }

    private func log(_ name: String, _ p: [String: Any]) {
        #if canImport(FirebaseCore)
        guard analytics, !name.isEmpty else { return }
        Analytics.logEvent(String(name.lowercased().map { $0.isLetter || $0.isNumber ? $0 : "_" }.prefix(40)), parameters: p)
        #endif
    }

    private func top() -> UIViewController? {
        var t = webView?.window?.rootViewController
        while let n = t?.presentedViewController { t = n }
        return t
    }
    private func present(_ vc: UIViewController) { top()?.present(vc, animated: true) }

    static let dailyId = "zv.daily.reminder"
    /// Daily local notification at HH:MM ("daily puzzle" reminder); asks the permission the first time.
    private func remind(_ b: [String: Any]) async -> Bool {
        let c = UNUserNotificationCenter.current()
        guard (try? await c.requestAuthorization(options: [.alert, .sound])) == true else { return false }
        let hm = (b["heure"] as? String ?? "09:00").split(separator: ":").compactMap { Int($0) }
        var when = DateComponents(); when.hour = min(23, max(0, hm.first ?? 9)); when.minute = hm.count > 1 ? min(59, max(0, hm[1])) : 0
        let content = UNMutableNotificationContent()
        content.title = b["titre"] as? String ?? ""; content.body = b["texte"] as? String ?? ""; content.sound = .default
        c.removePendingNotificationRequests(withIdentifiers: [Self.dailyId])
        do { try await c.add(UNNotificationRequest(identifier: Self.dailyId, content: content, trigger: UNCalendarNotificationTrigger(dateMatching: when, repeats: true))) }
        catch { return false }
        return true
    }

    /// The App Store page inside the game (no app switch), the classic way for cross-promotion.
    private func openStore(_ g: Game) {
        log("promo_open", ["game": g.bundle])
        let vc = SKStoreProductViewController(); vc.delegate = self
        vc.loadProduct(withParameters: [SKStoreProductParameterITunesItemIdentifier: g.appId], completionBlock: nil)
        present(vc)
    }
    func productViewControllerDidFinish(_ vc: SKStoreProductViewController) { vc.dismiss(animated: true) }
}

/// "Our other games" list, or (house) one big card. Plain UIKit: icons are ios/Shared/Promo/promo-<bundle-suffix>.png,
/// copied to the app bundle root, so it looks the same in every game whatever its own style.
final class PromoController: UIViewController {
    let games: [NativeKit.Game]; let en: Bool; let house: Bool; let onOpen: (NativeKit.Game) -> Void
    var onClose: (() -> Void)?
    init(games: [NativeKit.Game], en: Bool, house: Bool, open: @escaping (NativeKit.Game) -> Void) {
        self.games = games; self.en = en; self.house = house; self.onOpen = open
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = house ? .overFullScreen : .pageSheet
        if let s = sheetPresentationController { s.detents = [.medium(), .large()]; s.prefersGrabberVisible = true }
    }
    required init?(coder: NSCoder) { fatalError() }
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if isBeingDismissed { onClose?(); onClose = nil }
    }

    private func icon(_ g: NativeKit.Game) -> UIImage? {
        let suffix = g.bundle.split(separator: ".").last.map(String.init) ?? ""
        guard let p = Bundle.main.path(forResource: "promo-" + suffix, ofType: "png") else { return nil }
        return UIImage(contentsOfFile: p)
    }
    private static func color(_ hex: String) -> UIColor {
        var v: UInt64 = 0; Scanner(string: hex.replacingOccurrences(of: "#", with: "")).scanHexInt64(&v)
        return UIColor(red: CGFloat(v >> 16 & 255) / 255, green: CGFloat(v >> 8 & 255) / 255, blue: CGFloat(v & 255) / 255, alpha: 1)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = house ? UIColor.black.withAlphaComponent(0.82) : .systemBackground
        let stack = UIStackView(); stack.axis = .vertical; stack.spacing = house ? 18 : 14; stack.alignment = house ? .center : .fill
        stack.translatesAutoresizingMaskIntoConstraints = false
        let title = UILabel(); title.font = .systemFont(ofSize: house ? 15 : 22, weight: .heavy)
        title.text = house ? (en ? "FROM THE SAME STUDIO" : "DU MÊME STUDIO") : (en ? "Our other games" : "Nos autres jeux")
        title.textColor = house ? UIColor.white.withAlphaComponent(0.7) : .label
        stack.addArrangedSubview(title)
        for g in games { stack.addArrangedSubview(house ? bigCard(g) : row(g)) }
        if house {
            view.addSubview(stack)
            NSLayoutConstraint.activate([stack.centerYAnchor.constraint(equalTo: view.centerYAnchor),
                                         stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
                                         stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24)])
            let close = UIButton(type: .close); close.translatesAutoresizingMaskIntoConstraints = false; close.alpha = 0
            close.addAction(UIAction { [weak self] _ in self?.dismiss(animated: true) }, for: .touchUpInside)
            view.addSubview(close)
            NSLayoutConstraint.activate([close.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
                                         close.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16)])
            UIView.animate(withDuration: 0.3, delay: 1.5) { close.alpha = 1 }     // the X appears after 1.5 s, like an ad
            return
        }
        let scroll = UIScrollView(); scroll.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scroll); scroll.addSubview(stack)
        NSLayoutConstraint.activate([
            scroll.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            scroll.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            scroll.leadingAnchor.constraint(equalTo: view.leadingAnchor), scroll.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            stack.topAnchor.constraint(equalTo: scroll.contentLayoutGuide.topAnchor, constant: 8),
            stack.bottomAnchor.constraint(equalTo: scroll.contentLayoutGuide.bottomAnchor, constant: -24),
            stack.leadingAnchor.constraint(equalTo: scroll.frameLayoutGuide.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: scroll.frameLayoutGuide.trailingAnchor, constant: -20),
        ])
    }

    private func row(_ g: NativeKit.Game) -> UIView {
        let b = UIButton(type: .system)
        var c = UIButton.Configuration.filled()
        c.baseBackgroundColor = Self.color(g.color).withAlphaComponent(0.14); c.baseForegroundColor = .label
        let box = CGRect(x: 0, y: 0, width: 64, height: 64)
        c.image = icon(g).map { img in UIGraphicsImageRenderer(size: box.size).image { _ in
            UIBezierPath(roundedRect: box, cornerRadius: 14).addClip(); img.draw(in: box) } }
        c.imagePadding = 14; c.imagePlacement = .leading
        c.title = g.name; c.subtitle = en ? g.en : g.fr; c.titleAlignment = .leading
        c.contentInsets = NSDirectionalEdgeInsets(top: 10, leading: 10, bottom: 10, trailing: 10)
        c.cornerStyle = .large
        b.configuration = c; b.contentHorizontalAlignment = .leading
        b.addAction(UIAction { [weak self] _ in self?.onOpen(g) }, for: .touchUpInside)
        return b
    }

    private func bigCard(_ g: NativeKit.Game) -> UIView {
        let v = UIStackView(); v.axis = .vertical; v.alignment = .center; v.spacing = 14
        let img = UIImageView(image: icon(g)); img.layer.cornerRadius = 36; img.clipsToBounds = true
        img.widthAnchor.constraint(equalToConstant: 160).isActive = true; img.heightAnchor.constraint(equalToConstant: 160).isActive = true
        let name = UILabel(); name.text = g.name; name.font = .systemFont(ofSize: 28, weight: .heavy); name.textColor = .white
        let tag = UILabel(); tag.text = en ? g.en : g.fr; tag.font = .systemFont(ofSize: 17); tag.textColor = UIColor.white.withAlphaComponent(0.85)
        tag.numberOfLines = 0; tag.textAlignment = .center
        let go = UIButton(type: .system); var c = UIButton.Configuration.filled()
        c.baseBackgroundColor = Self.color(g.color); c.baseForegroundColor = .white; c.cornerStyle = .capsule
        c.title = en ? "Play free" : "Jouer gratuitement"; c.contentInsets = NSDirectionalEdgeInsets(top: 14, leading: 34, bottom: 14, trailing: 34)
        go.configuration = c
        go.addAction(UIAction { [weak self] _ in self?.onOpen(g) }, for: .touchUpInside)
        [img, name, tag, go].forEach { v.addArrangedSubview($0) }
        return v
    }
}
