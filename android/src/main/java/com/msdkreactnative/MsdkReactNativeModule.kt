package com.msdkreactnative

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.ecommpay.msdk.ui.EcmpActionType
import com.ecommpay.msdk.ui.EcmpAdditionalField
import com.ecommpay.msdk.ui.EcmpAdditionalFieldType
import com.ecommpay.msdk.ui.EcmpPaymentInfo
import com.ecommpay.msdk.ui.EcmpPaymentOptions
import com.ecommpay.msdk.ui.EcmpPaymentSDK
import com.ecommpay.msdk.ui.EcmpRecipientInfo
import com.ecommpay.msdk.ui.EcmpRecurrentData
import com.ecommpay.msdk.ui.EcmpRecurrentDataSchedule
import com.ecommpay.msdk.ui.EcmpScreenDisplayMode
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.msdkreactnative.extensions.*

class MsdkReactNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    init {
        reactContext.addActivityEventListener(this)
    }

    private var paymentPromise: Promise? = null

    override fun getName(): String {
        return "MsdkReactNative"
    }

    @ReactMethod
    fun initializePaymentWithOptions(
        params: ReadableMap,
        promise: Promise
    ) {
        val currentActivity = currentActivity ?: return

        val ecmpPaymentInfo = params.getMap("paymentInfo")?.let { it.buildPaymentInfo() }

        params.getMap("paymentInfo")?.let { Log.d("INFO", it.toString()) }

        // Create payment options
        val paymentOptions = EcmpPaymentOptions().apply {
            if (ecmpPaymentInfo != null) {
                paymentInfo = ecmpPaymentInfo
            }

            actionType = EcmpActionType.entries.toTypedArray()[params.getInt("actionType") - 1]

            additionalFields {
                params.getArray("additionalFields")?.let { array ->
                    mutableListOf<EcmpAdditionalField>().apply {
                        for (i in 0 until array.size()) {
                            add(array.getMap(i).buildAdditionalField())
                        }
                    }
                } ?: listOf()
            }

            screenDisplayModes {
                params.getArray("screenDisplayModes")?.let { array ->
                    mutableSetOf<EcmpScreenDisplayMode>().apply {
                        for (i in 0 until array.size()) {
                            add(EcmpScreenDisplayMode.entries[array.getInt(i) - 1])
                        }
                    }
                } ?: emptySet()
            }

            isDarkTheme = params.getBoolean("isDarkTheme")
            recipientInfo = params.getMap("recipientInfo")?.let { it.buildRecipientInfo() }
            recurrentData = params.getMap("recurrentData")?.let { it.buildRecurrentInfo() }
            hideScanningCards = params.safeGetBoolean("hideScanningCards")

            merchantId = params.getString("googleMerchantId") ?: ""
            merchantName = params.getString("googleMerchantName") ?: ""
            isTestEnvironment = params.safeGetBoolean("googleIsTestEnvironment")

            // Brand customization
            params.getString("brandColor")?.let { colorString ->
                brandColor = colorString
            }

            // Stored card type
            storedCardType = params.safeGetInt("storedCardType")
        }

        val mockMode = EcmpPaymentSDK.EcmpMockModeType.entries[params.getInt("mockModeType")]

        // Initialize SDK and open payment form
        val sdk = EcmpPaymentSDK(currentActivity.applicationContext, paymentOptions, mockMode)

        paymentPromise = promise

        val intent = sdk.intent
        currentActivity.startActivityForResult(intent, 1001)
    }

    @ReactMethod
    fun getParamsForSignature(params: ReadableMap, promise: Promise) {
        Log.d("MSDK", "getParamsForSignature called with: $params")
        try {
            val paymentInfoMap = params.getMap("paymentInfo") ?: params
            val ecmpPaymentInfo = paymentInfoMap.buildPaymentInfo()
            Log.d("MSDK", "Created EcmpPaymentInfo: $ecmpPaymentInfo")

            val result = ecmpPaymentInfo.getParamsForSignature()
            Log.d("MSDK", "getParamsForSignature result: $result")
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e("MSDK", "getParamsForSignature error: ${e.message}")
            promise.reject("GET_PARAMS_ERROR", e.message, e)
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        when (resultCode) {
            EcmpPaymentSDK.RESULT_SUCCESS -> {
                val paymentJson = data?.getStringExtra(EcmpPaymentSDK.EXTRA_PAYMENT)
                val resultMap = Arguments.createMap()
                resultMap.putString("paymentJson", paymentJson)
                resultMap.putInt("resultCode", resultCode)
                paymentPromise?.resolve(resultMap)
            }

            EcmpPaymentSDK.RESULT_ERROR -> {
                val errorCode = data?.getStringExtra(EcmpPaymentSDK.EXTRA_ERROR_CODE)
                val errorMessage = data?.getStringExtra(EcmpPaymentSDK.EXTRA_ERROR_MESSAGE)
                val resultMap = Arguments.createMap()
                resultMap.putString("errorCode", errorCode)
                resultMap.putString("errorMessage", errorMessage)
                paymentPromise?.resolve(resultMap)
            }

            else -> {
               paymentPromise?.resolve(resultCode)
            }
        }
        paymentPromise = null
    }

    override fun onNewIntent(data: Intent?) {}

}
