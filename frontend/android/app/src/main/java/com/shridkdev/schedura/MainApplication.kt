package com.shridkdev.schedura

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

    // Wrap ReactNativeHost with Expo wrapper
    private val mReactNativeHost: ReactNativeHost by lazy {
        ReactNativeHostWrapper(
            this,
            object : ReactNativeHost(this) {
                override fun getUseDeveloperSupport(): Boolean {
                    return BuildConfig.DEBUG
                }

                override fun getPackages(): List<ReactPackage> {
                    // Packages auto-linked by React Native
                    return PackageList(this).packages
                }

                override fun getJSMainModuleName(): String {
                    return "index"
                }
            }
        )
    }

    override fun getReactNativeHost(): ReactNativeHost {
        return mReactNativeHost
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        ApplicationLifecycleDispatcher.onApplicationCreate(this)
    }
}
