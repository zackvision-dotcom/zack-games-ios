import StoreKit
import WebKit

/// Apple in-app purchases (StoreKit 2) for the web games, with no third-party SDK.
/// The page calls `window.webkit.messageHandlers.store.postMessage({op, ...})`, which returns a Promise:
///   {op:'products', ids:[…]} -> [{id, price, title}]   (localised price string from the App Store)
///   {op:'buy', id}           -> {ok:true, id} | {ok:false, err:'cancel'|'pending'|'unverified'|'unknown'}
///   {op:'owned'}             -> [product ids of non-consumables the player owns]
///   {op:'restore'}           -> same as owned, after syncing with the App Store (asks to sign in if needed)
///   {op:'drain'}             -> [product ids bought outside a buy() call: Ask to Buy, interrupted purchase…]
/// After the first 'drain', such late purchases are pushed live with `window.nativeStoreUpdate(id)`.
final class NativeStore: NSObject, WKScriptMessageHandlerWithReply {
    weak var webView: WKWebView?
    private var products: [String: Product] = [:]
    private var queued: [String] = []
    private var pageReady = false
    private var updates: Task<Void, Never>?

    override init() {
        super.init()
        updates = Task.detached { [weak self] in
            for await result in Transaction.updates {
                guard case .verified(let tx) = result else { continue }
                await self?.late(tx)
            }
        }
    }

    deinit { updates?.cancel() }

    @MainActor private func late(_ tx: Transaction) async {
        await tx.finish()
        if tx.revocationDate != nil { return }
        if pageReady, let web = webView {
            let id = tx.productID.replacingOccurrences(of: "'", with: "")
            web.evaluateJavaScript("window.nativeStoreUpdate && window.nativeStoreUpdate('\(id)')", completionHandler: nil)
        } else {
            queued.append(tx.productID)
        }
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard let body = message.body as? [String: Any], let op = body["op"] as? String else {
            replyHandler(nil, "bad message"); return
        }
        Task { @MainActor in
            do { replyHandler(try await self.run(op, body), nil) }
            catch { replyHandler(nil, error.localizedDescription) }
        }
    }

    @MainActor private func run(_ op: String, _ body: [String: Any]) async throws -> Any {
        switch op {
        case "products":
            let ids = body["ids"] as? [String] ?? []
            let list = try await Product.products(for: ids)
            for p in list { products[p.id] = p }
            return list.map { ["id": $0.id, "price": $0.displayPrice, "title": $0.displayName] }
        case "buy":
            guard let id = body["id"] as? String else { return ["ok": false, "err": "unknown"] }
            var product = products[id]
            if product == nil { product = try await Product.products(for: [id]).first; products[id] = product }
            guard let p = product else { return ["ok": false, "err": "unknown"] }
            switch try await p.purchase() {
            case .success(let result):
                guard case .verified(let tx) = result else { return ["ok": false, "err": "unverified"] }
                await tx.finish()
                return ["ok": true, "id": tx.productID]
            case .userCancelled: return ["ok": false, "err": "cancel"]
            case .pending: return ["ok": false, "err": "pending"]
            @unknown default: return ["ok": false, "err": "unknown"]
            }
        case "restore":
            try await AppStore.sync()
            return await owned()
        case "owned":
            return await owned()
        case "drain":
            pageReady = true
            let ids = queued; queued = []
            return ids
        default:
            throw NSError(domain: "NativeStore", code: 1, userInfo: [NSLocalizedDescriptionKey: "unknown op \(op)"])
        }
    }

    private func owned() async -> [String] {
        var ids: [String] = []
        for await result in Transaction.currentEntitlements {
            if case .verified(let tx) = result, tx.revocationDate == nil, tx.productType == .nonConsumable { ids.append(tx.productID) }
        }
        return ids
    }
}
