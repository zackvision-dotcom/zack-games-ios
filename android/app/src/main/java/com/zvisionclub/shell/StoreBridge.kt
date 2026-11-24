package com.zvisionclub.shell

import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClient.BillingResponseCode
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.suspendCancellableCoroutine
import org.json.JSONArray
import org.json.JSONObject
import kotlin.coroutines.resume

/**
 * Google Play Billing for the web games, same messages as ios/Shared/NativeStore.swift:
 *   {op:'products', ids:[…]} -> [{id, price, title}]
 *   {op:'buy', id}           -> {ok:true, id} | {ok:false, err:'cancel'|'pending'|'unknown'}
 *   {op:'owned'} / {op:'restore'} -> [non-consumable product ids the player owns]
 *   {op:'drain'}             -> [product ids bought outside a buy() call (pending payment completed, interrupted purchase)]
 * Consumables (android/games.json) are consumed after delivery; everything else is acknowledged (Play refunds unacknowledged buys).
 */
class StoreBridge(private val act: MainActivity) : PurchasesUpdatedListener {
    private val prefix = "com.zvisionclub.${BuildConfig.GAME}."
    private val consumables = BuildConfig.CONSUMABLES.split(',').filter { it.isNotBlank() }.map { prefix + it }.toSet()
    private val details = HashMap<String, ProductDetails>()
    private var waiting: CompletableDeferred<JSONObject>? = null
    private var waitingId: String? = null
    private val queued = ArrayList<String>()
    private var pageReady = false

    private val client: BillingClient = BillingClient.newBuilder(act)
        .setListener(this)
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .enableAutoServiceReconnection()
        .build()

    fun close() { try { client.endConnection() } catch (_: Exception) {} }

    private suspend fun ready(): Boolean {
        if (client.isReady) return true
        return suspendCancellableCoroutine { c ->
            client.startConnection(object : BillingClientStateListener {
                override fun onBillingSetupFinished(r: BillingResult) { if (c.isActive) c.resume(r.responseCode == BillingResponseCode.OK) }
                override fun onBillingServiceDisconnected() { if (c.isActive) c.resume(false) }
            })
        }
    }

    suspend fun run(b: JSONObject): Any? {
        val op = b.optString("op")
        if (!ready()) return when (op) { "buy" -> JSONObject().put("ok", false).put("err", "unknown"); "products", "owned", "restore", "drain" -> JSONArray(); else -> null }
        return when (op) {
            "products" -> products(b.optJSONArray("ids") ?: JSONArray())
            "buy" -> buy(b.optString("id"))
            "owned", "restore" -> JSONArray(owned())
            "drain" -> { pageReady = true; settleOld(); val ids = JSONArray(queued); queued.clear(); ids }
            else -> throw IllegalArgumentException("unknown op $op")
        }
    }

    private suspend fun query(ids: List<String>): List<ProductDetails> {
        if (ids.isEmpty()) return emptyList()
        val params = QueryProductDetailsParams.newBuilder().setProductList(ids.map {
            QueryProductDetailsParams.Product.newBuilder().setProductId(it).setProductType(BillingClient.ProductType.INAPP).build()
        }).build()
        return suspendCancellableCoroutine { c ->
            client.queryProductDetailsAsync(params) { r, result ->
                val list = if (r.responseCode == BillingResponseCode.OK) result.productDetailsList else emptyList()
                for (p in list) details[p.productId] = p
                if (c.isActive) c.resume(list)
            }
        }
    }

    private suspend fun products(ids: JSONArray): JSONArray {
        val out = JSONArray()
        for (p in query((0 until ids.length()).map { ids.getString(it) })) {
            out.put(JSONObject().put("id", p.productId).put("price", p.oneTimePurchaseOfferDetails?.formattedPrice ?: "").put("title", p.name))
        }
        return out
    }

    private suspend fun buy(id: String): JSONObject {
        val p = details[id] ?: query(listOf(id)).firstOrNull() ?: return JSONObject().put("ok", false).put("err", "unknown")
        val d = CompletableDeferred<JSONObject>()
        waiting = d; waitingId = id
        val flow = BillingFlowParams.newBuilder().setProductDetailsParamsList(listOf(
            BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(p).build())).build()
        val r = client.launchBillingFlow(act, flow)
        if (r.responseCode != BillingResponseCode.OK) {
            waiting = null; waitingId = null
            return JSONObject().put("ok", false).put("err", if (r.responseCode == BillingResponseCode.USER_CANCELED) "cancel" else "unknown")
        }
        return d.await()
    }

    override fun onPurchasesUpdated(r: BillingResult, purchases: MutableList<Purchase>?) {
        val w = waiting
        when (r.responseCode) {
            BillingResponseCode.OK -> {
                var answered = false
                for (pu in purchases.orEmpty()) {
                    val mine = pu.products.contains(waitingId)
                    if (pu.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        settle(pu) { ok ->
                            if (!ok) return@settle
                            if (mine && w != null && !w.isCompleted) { w.complete(JSONObject().put("ok", true).put("id", pu.products.first())) }
                            else late(pu.products)
                        }
                        if (mine) answered = true
                    } else if (pu.purchaseState == Purchase.PurchaseState.PENDING && mine && w != null) {
                        w.complete(JSONObject().put("ok", false).put("err", "pending")); answered = true
                    }
                }
                if (!answered && w != null && !w.isCompleted && waitingId != null && purchases.isNullOrEmpty()) w.complete(JSONObject().put("ok", false).put("err", "unknown"))
            }
            BillingResponseCode.USER_CANCELED -> w?.complete(JSONObject().put("ok", false).put("err", "cancel"))
            BillingResponseCode.ITEM_ALREADY_OWNED -> w?.complete(JSONObject().put("ok", true).put("id", waitingId))
            else -> w?.complete(JSONObject().put("ok", false).put("err", "unknown"))
        }
        if (w == null || w.isCompleted) { waiting = null; waitingId = null }
    }

    /** Consumes a consumable / acknowledges a non-consumable; the item is granted only once that succeeded. */
    private fun settle(pu: Purchase, done: (Boolean) -> Unit) {
        val id = pu.products.firstOrNull() ?: return done(false)
        if (id in consumables) {
            client.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(pu.purchaseToken).build()) { r, _ -> act.runOnUiThread { done(r.responseCode == BillingResponseCode.OK) } }
        } else if (!pu.isAcknowledged) {
            client.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(pu.purchaseToken).build()) { r -> act.runOnUiThread { done(r.responseCode == BillingResponseCode.OK) } }
        } else done(true)
    }

    private fun late(ids: List<String>) {
        if (pageReady) for (id in ids) act.bridge.push("window.nativeStoreUpdate && window.nativeStoreUpdate(" + JSONObject.quote(id) + ")")
        else queued.addAll(ids)
    }

    private suspend fun purchases(): List<Purchase> = suspendCancellableCoroutine { c ->
        client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build()) { r, list ->
            if (c.isActive) c.resume(if (r.responseCode == BillingResponseCode.OK) list else emptyList())
        }
    }

    private suspend fun owned(): List<String> =
        purchases().filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }.flatMap { it.products }.filter { it !in consumables }.distinct()

    /** At start: purchases paid while the game was closed (pending payments) are delivered once. */
    private suspend fun settleOld() {
        for (pu in purchases()) {
            if (pu.purchaseState != Purchase.PurchaseState.PURCHASED) continue
            val id = pu.products.firstOrNull() ?: continue
            if (id in consumables) settle(pu) { ok -> if (ok) late(pu.products) }
            else if (!pu.isAcknowledged) settle(pu) { ok -> if (ok) late(pu.products) }
        }
    }
}
