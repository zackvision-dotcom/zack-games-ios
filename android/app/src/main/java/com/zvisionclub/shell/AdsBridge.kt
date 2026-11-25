package com.zvisionclub.shell

import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.suspendCancellableCoroutine
import org.json.JSONObject
import kotlin.coroutines.resume

/**
 * AdMob (interstitial + rewarded) with Google's consent form (UMP), same messages as ios/Ads/NativeAds.swift:
 *   {op:'init'} -> true when ads can be requested (first call: UMP update + form if required, then SDK start + preload)
 *   {op:'interstitial'} -> true if shown (resolves when closed) | {op:'rewarded'} -> true only if the reward was earned
 *   {op:'consentForm'} -> Google's privacy options form | {op:'status'} -> {test, started, canRequestAds, ...}
 * Units: BuildConfig (Google's test units unless the release was built with -PADS_TEST=0 and android/admob.json has the game).
 */
class AdsBridge(private val act: MainActivity) {
    private val consent: ConsentInformation = UserMessagingPlatform.getConsentInformation(act)
    private var started = false
    private var startJob: CompletableDeferred<Boolean>? = null
    private var interstitial: InterstitialAd? = null
    private var rewarded: RewardedAd? = null
    private var loadingI = false
    private var loadingR = false
    private var showing = false

    suspend fun run(b: JSONObject): Any? = when (b.optString("op")) {
        "init" -> start()
        "interstitial" -> showInterstitial()
        "rewarded" -> showRewarded()
        "consentForm" -> privacyOptions()
        "status" -> JSONObject().put("test", BuildConfig.ADS_TEST).put("started", started).put("canRequestAds", consent.canRequestAds())
            .put("interstitialReady", interstitial != null).put("rewardedReady", rewarded != null)
            .put("privacyOptions", consent.privacyOptionsRequirementStatus == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED)
        else -> false
    }

    private suspend fun start(): Boolean {
        if (started) return true
        startJob?.let { return it.await() }
        val job = CompletableDeferred<Boolean>(); startJob = job
        suspendCancellableCoroutine { c ->
            consent.requestConsentInfoUpdate(act, ConsentRequestParameters.Builder().build(), {
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(act) { if (c.isActive) c.resume(Unit) }
            }, { if (c.isActive) c.resume(Unit) })
        }
        if (consent.canRequestAds()) {
            // Audience 13+ on Play: cap ad content at Teen so sensitive/mature ads are excluded (privacy page says so).
            MobileAds.setRequestConfiguration(RequestConfiguration.Builder()
                .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_T).build())
            suspendCancellableCoroutine { c -> MobileAds.initialize(act) { if (c.isActive) c.resume(Unit) } }
            started = true
            loadInterstitial(); loadRewarded()
        }
        job.complete(started)
        return started
    }

    private fun loadInterstitial() {
        if (!started || loadingI || interstitial != null) return
        loadingI = true
        InterstitialAd.load(act, BuildConfig.AD_INTERSTITIAL, AdRequest.Builder().build(), object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) { interstitial = ad; loadingI = false }
            override fun onAdFailedToLoad(e: LoadAdError) { interstitial = null; loadingI = false }
        })
    }

    private fun loadRewarded() {
        if (!started || loadingR || rewarded != null) return
        loadingR = true
        RewardedAd.load(act, BuildConfig.AD_REWARDED, AdRequest.Builder().build(), object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) { rewarded = ad; loadingR = false }
            override fun onAdFailedToLoad(e: LoadAdError) { rewarded = null; loadingR = false }
        })
    }

    private fun callback(done: CompletableDeferred<Unit>) = object : FullScreenContentCallback() {
        override fun onAdDismissedFullScreenContent() { done.complete(Unit) }
        override fun onAdFailedToShowFullScreenContent(e: AdError) { done.complete(Unit) }
    }

    private suspend fun showInterstitial(): Boolean {
        if (!start() || showing) return false
        val ad = interstitial ?: run { loadInterstitial(); return false }
        interstitial = null; showing = true
        val done = CompletableDeferred<Unit>()
        ad.fullScreenContentCallback = callback(done)
        ad.show(act)
        done.await(); showing = false
        loadInterstitial()
        return true
    }

    private suspend fun showRewarded(): Boolean {
        if (!start() || showing) return false
        val ad = rewarded ?: run { loadRewarded(); return false }
        rewarded = null; showing = true
        val done = CompletableDeferred<Unit>()
        var earned = false
        ad.fullScreenContentCallback = callback(done)
        ad.show(act) { earned = true }
        done.await(); showing = false
        loadRewarded()
        return earned
    }

    private suspend fun privacyOptions(): Boolean = suspendCancellableCoroutine { c ->
        UserMessagingPlatform.showPrivacyOptionsForm(act) { e -> if (c.isActive) c.resume(e == null) }
    }
}
