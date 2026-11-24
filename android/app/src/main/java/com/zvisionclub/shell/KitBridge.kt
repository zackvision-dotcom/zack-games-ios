package com.zvisionclub.shell

import android.content.Intent
import android.util.Base64
import androidx.core.content.FileProvider
import com.google.android.play.core.review.ReviewManagerFactory
import kotlinx.coroutines.suspendCancellableCoroutine
import org.json.JSONObject
import java.io.File
import kotlin.coroutines.resume

/**
 * window.ZV on Android (same API as ios/Shared/NativeKit.swift):
 *   joy -> Google Play in-app review (3rd launch or later, 2nd joy of the session, 60 days between asks; Play also caps it)
 *   share / shareFile -> Android share sheet with the game's Play Store link
 *   more / house -> nothing yet (0 other games on Google Play: the game hides the button and falls back to no house ad)
 *   event -> analytics (Firebase comes with the google-services.json files; no-op until then)
 */
class KitBridge(private val act: MainActivity) {
    private val prefs = act.getSharedPreferences("zv", 0)
    private var joys = 0
    private val link get() = "https://play.google.com/store/apps/details?id=${act.packageName}"

    init { prefs.edit().putInt("launches", prefs.getInt("launches", 0) + 1).apply() }

    fun others(): Int = 0

    suspend fun run(b: JSONObject): Any? = when (b.optString("op")) {
        "joy" -> joy()
        "share" -> { share(b.optString("text"), null); true }
        "shareFile" -> { shareFile(b.optString("name", "clip.mp4"), b.optString("data"), b.optString("text")); true }
        "more", "house" -> false
        "event" -> true
        else -> false
    }

    private suspend fun joy(): Boolean {
        joys++
        val now = System.currentTimeMillis()
        if (prefs.getInt("launches", 0) < 3 || joys < 2 || now - prefs.getLong("asked", 0) < 60L * 24 * 3600 * 1000) return false
        prefs.edit().putLong("asked", now).apply()
        val m = ReviewManagerFactory.create(act)
        val info = suspendCancellableCoroutine { c -> m.requestReviewFlow().addOnCompleteListener { t -> if (c.isActive) c.resume(if (t.isSuccessful) t.result else null) } } ?: return false
        return suspendCancellableCoroutine { c -> m.launchReviewFlow(act, info).addOnCompleteListener { if (c.isActive) c.resume(true) } }
    }

    private fun share(text: String, file: File?) {
        val i = Intent(Intent.ACTION_SEND).putExtra(Intent.EXTRA_TEXT, (text + "\n" + link).trim())
        if (file != null) {
            val uri = FileProvider.getUriForFile(act, act.packageName + ".files", file)
            i.type = if (file.name.endsWith(".png")) "image/png" else if (file.name.endsWith(".jpg")) "image/jpeg" else "video/mp4"
            i.putExtra(Intent.EXTRA_STREAM, uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        } else i.type = "text/plain"
        act.startActivity(Intent.createChooser(i, null))
    }

    private fun shareFile(name: String, dataUrl: String, text: String) {
        val comma = dataUrl.indexOf(',')
        if (comma < 0) return share(text, null)
        val dir = File(act.cacheDir, "share").apply { mkdirs() }
        val f = File(dir, name.replace(Regex("[^A-Za-z0-9._-]"), "_"))
        f.writeBytes(Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT))
        share(text, f)
    }
}
