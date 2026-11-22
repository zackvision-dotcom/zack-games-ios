import UIKit
import WebKit

/// iOS has no navigator.vibrate in WKWebView, so every game's buzz() did nothing on iPhone.
/// A user script installs navigator.vibrate and forwards each call here, where it becomes a Taptic Engine tap:
/// a short buzz is a light tap, a longer one a medium or heavy tap, a pattern (array) a "success" notification.
final class NativeHaptics: NSObject, WKScriptMessageHandler {
    static let script = WKUserScript(source: """
        (function () {
          var h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic;
          if (!h) return;
          try {
            Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, writable: true,
              value: function (p) { try { h.postMessage(Array.isArray(p) ? p : [Number(p) || 0]); } catch (e) {} return true; } });
          } catch (e) {}
        })();
        """, injectionTime: .atDocumentStart, forMainFrameOnly: true)

    private let light = UIImpactFeedbackGenerator(style: .light)
    private let medium = UIImpactFeedbackGenerator(style: .medium)
    private let heavy = UIImpactFeedbackGenerator(style: .heavy)
    private let notify = UINotificationFeedbackGenerator()
    private var last = Date.distantPast

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let p = message.body as? [Any] else { return }
        let ms = p.compactMap { ($0 as? NSNumber)?.doubleValue }
        guard let first = ms.first, first > 0 else { return }       // vibrate(0) cancels: nothing to do
        let now = Date()
        if now.timeIntervalSince(last) < 0.04 { return }             // no more than ~25 taps a second
        last = now
        if ms.count > 1 { notify.notificationOccurred(.success); return }
        if first <= 15 { light.impactOccurred() } else if first <= 35 { medium.impactOccurred() } else { heavy.impactOccurred() }
    }
}
