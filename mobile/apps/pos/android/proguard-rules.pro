# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep all React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.soloader.** { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all classes that might be used by reflection
-keep public class * extends com.facebook.react.ReactActivity
-keep public class * extends com.facebook.react.ReactApplication

# Keep JavaScript interfaces
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactProp <methods>;
}
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactPropGroup <methods>;
}

# Keep Redux and Redux Saga
-keep class org.redux.** { *; }
-keep class io.invertase.firebase.** { *; }

# Keep SQLite related classes
-keep class io.liteglue.** { *; }
-keep class expo.modules.sqlite.** { *; }

# Keep Google Libphone number
-dontwarn java.beans.**
-keep class com.google.i18n.phonenumbers.** { *; }

# Keep network libraries
-keep class com.squareup.okhttp.** { *; }
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Keep biometric auth classes
-keep class expo.modules.localauthentication.** { *; }

# Keep audio/video classes
-keep class expo.modules.av.** { *; }

# Keep notification classes
-keep class expo.modules.notifications.** { *; }

# Keep navigation classes
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# Keep any custom native modules you might have
-keep class expo.modules.* { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
    public static *** w(...);
}

# Keep custom exceptions
-keep public class * extends java.lang.Exception

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep parcelable classes
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep serializable classes
-keep class * implements java.io.Serializable {
    *;
}

# Keep all public API classes and methods
-keep public class * {
    public *;
}

# Keep ReactNavigation classes
-keep class com.swmansion.rnscreens.** { *; }
-keep class androidx.core.** { *; }

# Keep React Native vector icons
-keep class com.oblador.vectoricons.** { *; }

# Suppress warnings
-dontwarn com.facebook.react.bridge.NavigationArgs
-dontwarn com.facebook.react.bridge.ReadableNativeMap
-dontwarn com.facebook.react.bridge.WritableNativeMap
-dontwarn com.facebook.react.uimanager.DisplayMetricsHolder
-dontwarn com.facebook.react.uimanager.RootViewUtil
-dontwarn com.facebook.react.uimanager.UIProp
-dontwarn com.facebook.react.views.toolbar.ReactToolbar
-dontwarn com.facebook.react.views.image.GlobalImageLoadListener
-dontwarn com.facebook.react.module.annotations.ReactModule
-dontwarn com.facebook.react.module.model.ReactModuleInfo
-dontwarn com.facebook.react.module.model.ReactModuleInfoProvider