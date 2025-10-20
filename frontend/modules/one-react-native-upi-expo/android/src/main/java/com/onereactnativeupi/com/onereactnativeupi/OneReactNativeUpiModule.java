package com.onereactnativeupi;

import android.app.Activity;
import android.net.Uri;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.content.pm.PackageManager;
import android.util.Log;
 
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;

import java.util.List;

@ReactModule(name = OneReactNativeUpiModule.NAME)
public class OneReactNativeUpiModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    public static final String NAME = "OneReactNativeUpi";
    private static final String FAILED = "FAILED";
    private static final String SUCCESS = "SUCCESS";
    private static final int REQUEST_CODE = 321;

    private Callback success;
    private Callback failure;
    private final Uri uri = Uri.parse("upi://pay");

    public OneReactNativeUpiModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    // -----------------------------------------------------------
    // Initiate Payment
    // -----------------------------------------------------------
    @ReactMethod
    public void initiatePayment(ReadableMap config, Callback success, Callback failure) {
        this.success = success;
        this.failure = failure;

        Uri data = uri.buildUpon()
                .appendQueryParameter("pa", config.getString("upiId"))
                .appendQueryParameter("pn", config.getString("name"))
                .appendQueryParameter("tn", config.getString("note"))
                .appendQueryParameter("am", config.getString("amount"))
                .appendQueryParameter("cu", "INR")
                .build();

        Intent upiPaymentIntent = new Intent(Intent.ACTION_VIEW);
        upiPaymentIntent.setData(data);

        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            if (this.failure != null) {
                WritableNativeMap message = new WritableNativeMap();
                message.putString("status", FAILED);
                message.putString("message", "No active activity found");
                this.failure.invoke(message);
            }
            this.success = null;
            this.failure = null;
            return;
        }

        try {
            if (config.hasKey("targetPackage") && config.getString("targetPackage").length() != 0) {
                upiPaymentIntent.setPackage(config.getString("targetPackage"));
                currentActivity.startActivityForResult(upiPaymentIntent, REQUEST_CODE);
            } else {
                Intent chooser = Intent.createChooser(upiPaymentIntent, config.getString("chooserText"));
                if (chooser.resolveActivity(currentActivity.getPackageManager()) != null) {
                    currentActivity.startActivityForResult(chooser, REQUEST_CODE);
                } else if (this.failure != null) {
                    WritableNativeMap message = new WritableNativeMap();
                    message.putString("status", FAILED);
                    message.putString("message", "No Apps Found for the UPI payment");
                    this.failure.invoke(message);
                }
            }
        } catch (Exception e) {
            if (this.failure != null) {
                WritableNativeMap message = new WritableNativeMap();
                message.putString("status", FAILED);
                message.putString("message", e.getMessage());
                this.failure.invoke(message);
            }
            this.success = null;
            this.failure = null;
        }
    }

    // -----------------------------------------------------------
    // Handle Activity Result
    // -----------------------------------------------------------
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        // Only handle our UPI request code
        Log.d(NAME, "onActivityResult called: requestCode=" + requestCode + ", resultCode=" + resultCode);
        if (requestCode != REQUEST_CODE) return;

        // Copy callbacks to local variables and clear them immediately
        Callback localSuccess = this.success;
        Callback localFailure = this.failure;
        this.success = null;
        this.failure = null;

        // If both callbacks are null, exit safely
        if (localSuccess == null && localFailure == null) return;

        WritableNativeMap response = new WritableNativeMap();

        try {
            if (data == null) {
                if (localFailure != null) {
                    response.putString("status", FAILED);
                    response.putString("message", "No Action Taken");
                    localFailure.invoke(response);
                }
                return;
            }

            String status = data.getStringExtra("Status");
            if (status != null && status.trim().equalsIgnoreCase(SUCCESS)) {
                if (localSuccess != null) {
                    response.putString("status", SUCCESS);
                    response.putString("txnId", data.getStringExtra("txnId"));
                    response.putString("code", data.getStringExtra("responseCode"));
                    response.putString("approvalRefNo", data.getStringExtra("ApprovalRefNo"));
                    localSuccess.invoke(response);
                }
            } else {
                if (localFailure != null) {
                    response.putString("status", FAILED);
                    response.putString("message", "Payment was not done!");
                    localFailure.invoke(response);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            if (localFailure != null) {
                response.putString("status", FAILED);
                response.putString("message", e.getMessage());
                localFailure.invoke(response);
            }
        }
    }

    // -----------------------------------------------------------
    // Get Installed UPI Apps (Promise version — TurboModule safe)
    // -----------------------------------------------------------
    @ReactMethod
    public void getInstalledUPIApps(Promise promise) {
        try {
            WritableNativeArray upiList = new WritableNativeArray();

            Uri uri = Uri.parse("upi://pay");
            Intent upiUriIntent = new Intent(Intent.ACTION_VIEW);
            upiUriIntent.setData(uri);

            PackageManager packageManager = getReactApplicationContext().getPackageManager();
            List<ResolveInfo> resolveInfoList = packageManager.queryIntentActivities(upiUriIntent, PackageManager.MATCH_DEFAULT_ONLY);

            if (resolveInfoList != null) {
                for (ResolveInfo resolveInfo : resolveInfoList) {
                    upiList.pushString(resolveInfo.activityInfo.packageName);
                }
            }

            promise.resolve(upiList);
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        // No handling needed for now
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }
}
