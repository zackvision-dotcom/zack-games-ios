package com.zvisionclub.shell

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Message
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

/** One full-screen WebView running the game bundled in the APK assets (the iOS Web folder), offline. */
class MainActivity : ComponentActivity() {
    lateinit var web: WebView
    lateinit var bridge: JsBridge
    private val host = "appassets.androidplatform.net"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        web = WebView(this)
        web.setBackgroundColor(android.graphics.Color.BLACK)
        setContentView(web)
        immersive()

        val s = web.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true                       // localStorage = the save, kept between launches
        s.mediaPlaybackRequiresUserGesture = false
        s.allowFileAccess = false
        s.allowContentAccess = false
        s.setSupportMultipleWindows(true)                // target=_blank links -> onCreateWindow -> external browser
        s.cacheMode = WebSettings.LOAD_DEFAULT
        s.textZoom = 100                                 // the system font size must not break the game layout
        web.isVerticalScrollBarEnabled = false
        web.isHorizontalScrollBarEnabled = false
        web.overScrollMode = View.OVER_SCROLL_NEVER

        bridge = JsBridge(this)
        web.addJavascriptInterface(bridge, "ZVAndroid")
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(web, JsBridge.shim(bridge.others()), setOf("https://$host"))
        }

        val loader = WebViewAssetLoader.Builder().setDomain(host)
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                loader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (request.url.host == host) return false
                openOutside(request.url); return true          // privacy policy, store pages, mailto: never inside the game
            }

            override fun onPageStarted(view: WebView, url: String?, favicon: android.graphics.Bitmap?) {
                // fallback for old WebViews without document-start scripts (the shim checks it is not installed twice)
                if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) view.evaluateJavascript(JsBridge.shim(bridge.others()), null)
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(m: android.webkit.ConsoleMessage): Boolean {
                if (BuildConfig.DEBUG) android.util.Log.i("ZVJS", "${m.messageLevel()} ${m.message()} @${m.sourceId()?.substringAfterLast('/')}:${m.lineNumber()}")
                return true
            }
            override fun onCreateWindow(view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message): Boolean {
                val href = view.hitTestResult.extra
                if (href != null) openOutside(Uri.parse(href))
                return false
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { moveTaskToBack(true) }   // the game has its own back buttons; keep it running
        })

        if (savedInstanceState != null) web.restoreState(savedInstanceState) else web.loadUrl("https://$host/assets/index.html")
    }

    fun openOutside(uri: Uri) {
        try { startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) {}
    }

    private fun immersive() {
        val c = WindowInsetsControllerCompat(window, window.decorView)
        c.hide(WindowInsetsCompat.Type.systemBars())
        c.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) { super.onWindowFocusChanged(hasFocus); if (hasFocus) immersive() }
    override fun onSaveInstanceState(outState: Bundle) { super.onSaveInstanceState(outState); web.saveState(outState) }
    override fun onPause() { super.onPause(); web.onPause() }        // stops the game's audio and timers in the background
    override fun onResume() { super.onResume(); web.onResume(); immersive() }
    override fun onDestroy() { bridge.close(); web.destroy(); super.onDestroy() }
}
