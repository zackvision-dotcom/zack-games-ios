import SwiftUI
import WebKit

/// One full-screen web view that runs the game bundled in Web/index.html (offline, no server).
@main
struct GameApp: App {
    var body: some Scene {
        WindowGroup {
            GameWebView()
                .ignoresSafeArea()
                .statusBarHidden(true)
                .persistentSystemOverlays(.hidden)   // no home indicator over the game
                .defersSystemGestures(on: .all)      // a swipe from an edge goes to the game first
        }
    }
}

struct GameWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.websiteDataStore = .default()          // keeps the save (localStorage) between launches
        config.userContentController.addScriptMessageHandler(context.coordinator.store, contentWorld: .page, name: "store")
        config.userContentController.add(context.coordinator.haptics, name: "haptic")   // navigator.vibrate → Taptic Engine
        config.userContentController.addUserScript(NativeHaptics.script)

        let view = WKWebView(frame: .zero, configuration: config)
        context.coordinator.store.webView = view       // in-app purchases (NativeStore.swift)
        view.uiDelegate = context.coordinator          // shows the game's alert() / confirm() as native dialogs
        view.isOpaque = false
        view.backgroundColor = .black
        view.scrollView.backgroundColor = .black
        view.scrollView.isScrollEnabled = false
        view.scrollView.bounces = false
        view.scrollView.contentInsetAdjustmentBehavior = .never
        view.allowsLinkPreview = false
        if #available(iOS 16.4, *) { view.isInspectable = false }

        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") {
            view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    /// Without a UI delegate, WKWebView silently drops alert() and makes confirm() return false
    /// (so "Recommencer" or "compte niveau max" did nothing when a save existed).
    final class Coordinator: NSObject, WKUIDelegate {
        let store = NativeStore()
        let haptics = NativeHaptics()

        private func present(_ alert: UIAlertController, from webView: WKWebView) {
            var top = webView.window?.rootViewController
            while let next = top?.presentedViewController { top = next }
            top?.present(alert, animated: true)
        }

        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
            present(a, from: webView)
        }

        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "Annuler", style: .cancel) { _ in completionHandler(false) })
            a.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
            present(a, from: webView)
        }
    }
}
