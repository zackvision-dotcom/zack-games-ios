package com.zvisionclub.shell

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

/**
 * The page talks to Android exactly as it talks to iOS: `window.webkit.messageHandlers.<name>.postMessage(obj)` returns a Promise.
 * The shim (installed before the game's scripts) forwards every call to ZVAndroid.post(name, json, id); the answer comes back
 * through window.__zvReply(id, ok, value). Handlers: store (Play Billing), ads (AdMob + UMP), kit (window.ZV), haptic.
 */
class JsBridge(private val act: MainActivity) {
    private val store = StoreBridge(act)
    private val ads = AdsBridge(act)
    private val kit = KitBridge(act)

    fun others(): Int = kit.others()
    fun close() { store.close() }

    @JavascriptInterface
    fun post(name: String, json: String, id: Int) {
        act.lifecycleScope.launch {
            try {
                val body = if (json.isBlank() || json == "null") JSONObject() else when (val v = org.json.JSONTokener(json).nextValue()) {
                    is JSONObject -> v
                    is JSONArray -> JSONObject().put("pattern", v)
                    else -> JSONObject().put("value", v)
                }
                val result: Any? = when (name) {
                    "store" -> store.run(body)
                    "ads" -> ads.run(body)
                    "kit" -> kit.run(body)
                    "haptic" -> { vibrate(body); true }
                    else -> throw IllegalArgumentException("unknown handler $name")
                }
                reply(id, true, result)
            } catch (e: Exception) {
                reply(id, false, e.message ?: "error")
            }
        }
    }

    /** Lets the store push late purchases (pending payment completed) like iOS: window.nativeStoreUpdate(id). */
    fun push(js: String) { act.runOnUiThread { act.web.evaluateJavascript(js, null) } }

    private fun reply(id: Int, ok: Boolean, value: Any?) {
        val v = JSONObject.wrap(value) ?: JSONObject.NULL
        val text = if (v is String) JSONObject.quote(v) else v.toString()
        act.web.evaluateJavascript("window.__zvReply && window.__zvReply($id, $ok, $text)", null)
    }

    private var lastBuzz = 0L
    private fun vibrate(b: JSONObject) {
        val now = System.currentTimeMillis(); if (now - lastBuzz < 40) return; lastBuzz = now
        val ms: Long = when {
            b.has("style") -> when (b.optString("style")) { "light" -> 10; "medium" -> 20; "heavy" -> 35; else -> 25 }
            b.has("pattern") -> (b.getJSONArray("pattern").optLong(0, 15)).coerceIn(5, 400)
            else -> 15
        }
        val v: Vibrator = if (Build.VERSION.SDK_INT >= 31) (act.getSystemService(VibratorManager::class.java)).defaultVibrator
                          else @Suppress("DEPRECATION") act.getSystemService(Vibrator::class.java)
        if (!v.hasVibrator()) return
        if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
        else @Suppress("DEPRECATION") v.vibrate(ms)
    }

    companion object {
        /** Installed at document start: window.webkit.messageHandlers, window.ZV (same API as ios/Shared/NativeKit.swift), navigator.vibrate. */
        fun shim(others: Int): String = """
(function () {
  if (window.__zvShim) return; window.__zvShim = true;
  var A = window.ZVAndroid; if (!A) return;
  var cb = {}, n = 0;
  window.__zvReply = function (id, ok, v) { var c = cb[id]; if (!c) return; delete cb[id]; ok ? c[0](v) : c[1](new Error(String(v))); };
  function h(name) { return { postMessage: function (o) { return new Promise(function (res, rej) {
    var id = ++n; cb[id] = [res, rej]; A.post(name, JSON.stringify(o === undefined ? null : o), id); }); } }; }
  window.webkit = { messageHandlers: { store: h('store'), ads: h('ads'), kit: h('kit'), haptic: h('haptic') } };
  window.ZVPlatform = 'android';
  var k = window.webkit.messageHandlers.kit;
  var call = function (o) { try { return k.postMessage(o); } catch (e) { return Promise.resolve(false); } };
  window.ZV = { available: true, others: $others, platform: 'android',
    joy: function (tag) { return call({ op: 'joy', tag: String(tag || '') }); },
    share: function (text) { return call({ op: 'share', text: String(text || '') }); },
    shareFile: function (name, dataUrl, text) { return call({ op: 'shareFile', name: String(name || 'clip.mp4'), data: String(dataUrl || ''), text: String(text || '') }); },
    moreGames: function (lang) { return call({ op: 'more', lang: lang || document.documentElement.lang || 'fr' }); },
    houseAd: function (lang) { return call({ op: 'house', lang: lang || document.documentElement.lang || 'fr' }); },
    event: function (name, p) { return call({ op: 'event', name: String(name || ''), params: p || {} }); },
    remind: function (hhmm, title, body) { return call({ op: 'remind', heure: String(hhmm || '09:00'), titre: String(title || ''), texte: String(body || '') }); },
    remindOff: function () { return call({ op: 'remindOff' }); } };
  var hp = window.webkit.messageHandlers.haptic;
  try { Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, writable: true,
    value: function (p) { try { hp.postMessage(Array.isArray(p) ? p : [Number(p) || 0]); } catch (e) {} return true; } }); } catch (e) {}
})();
"""
    }
}
