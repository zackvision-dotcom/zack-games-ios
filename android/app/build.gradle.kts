import groovy.json.JsonSlurper

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// One flavor per game (android/games.json). The web bundle is the same folder as the iOS app (ios/<Game>/Web),
// served from the APK assets by WebViewAssetLoader; the bridges imitate WKWebView's window.webkit.messageHandlers.
@Suppress("UNCHECKED_CAST")
val games = JsonSlurper().parse(rootProject.file("games.json")) as List<Map<String, Any>>
// Real AdMob ids per game (android/admob.json: {flavor: {app, interstitial, rewarded}}); missing -> Google's test ids.
@Suppress("UNCHECKED_CAST")
val admob = rootProject.file("admob.json").let { if (it.exists()) JsonSlurper().parse(it) as Map<String, Map<String, String>> else emptyMap() }
val adsTest = (project.findProperty("ADS_TEST") ?: "1").toString() != "0"
val vCode = (project.findProperty("VERSION_CODE") ?: "1").toString().toInt()
val vName = (project.findProperty("VERSION_NAME") ?: "1.0").toString()

android {
    namespace = "com.zvisionclub.shell"
    compileSdk = 36

    defaultConfig {
        minSdk = 24
        targetSdk = 36
        versionCode = vCode
        versionName = vName
    }

    // "store" = where the build goes. Only Google Play for now; Samsung Galaxy Store / Xiaomi / Huawei (no Google services)
    // get their own entries here when Zack opens those accounts (billing + ads differ per store).
    flavorDimensions += listOf("game", "store")
    productFlavors {
        create("play") { dimension = "store"; buildConfigField("String", "STORE", "\"play\"") }
        for (g in games) {
            val f = g["flavor"] as String
            val ids = admob[f]
            val real = !adsTest && ids != null
            create(f) {
                dimension = "game"
                applicationId = "com.zvisionclub.$f"
                resValue("string", "app_name", g["label"] as String)
                manifestPlaceholders["orientation"] = if (g["landscape"] == true) "sensorLandscape" else "sensorPortrait"
                manifestPlaceholders["admobAppId"] = if (ids != null) ids["app"]!! else "ca-app-pub-3940256099942544~3347511713"
                buildConfigField("String", "GAME", "\"$f\"")
                buildConfigField("String", "CONSUMABLES", "\"" + (g["consumables"] as List<*>).joinToString(",") + "\"")
                buildConfigField("boolean", "ADS_TEST", (!real).toString())
                buildConfigField("String", "AD_INTERSTITIAL", "\"" + (if (real) ids!!["interstitial"] else "ca-app-pub-3940256099942544/1033173712") + "\"")
                buildConfigField("String", "AD_REWARDED", "\"" + (if (real) ids!!["rewarded"] else "ca-app-pub-3940256099942544/5224354917") + "\"")
            }
            sourceSets.getByName(f) {
                assets.srcDirs(rootProject.file("../ios/${g["web"]}/Web"))
                res.srcDirs(rootProject.file("res/$f"))
            }
        }
    }

    signingConfigs {
        create("upload") {
            // Upload key (Play App Signing keeps the real key). Provided by CI secrets only; absent -> unsigned release.
            val ks = System.getenv("ANDROID_KEYSTORE")
            if (ks != null && file(ks).exists()) {
                storeFile = file(ks)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS")
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (System.getenv("ANDROID_KEYSTORE") != null) signingConfig = signingConfigs.getByName("upload")
        }
    }

    buildFeatures { buildConfig = true; resValues = true }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    androidResources { noCompress += listOf("mp3", "ogg", "m4a", "png", "jpg", "webp") }
}

dependencies {
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.webkit:webkit:1.13.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("com.android.billingclient:billing:8.0.0")
    implementation("com.google.android.gms:play-services-ads:24.4.0")
    implementation("com.google.android.ump:user-messaging-platform:3.2.0")
    implementation("com.google.android.play:review-ktx:2.0.2")
}
