# The page calls these through addJavascriptInterface
-keepclassmembers class com.zvisionclub.shell.JsBridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
