package com.msdkreactnative

import android.app.Activity
import android.content.Intent
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

        val ecmpPaymentInfo = params.getMap("paymentInfo")?.let { paymentInfo(it) }
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
                            add(additionalField(array.getMap(i)))
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
            recipientInfo = params.getMap("recipientInfo")?.let { recipientInfo(it) }
            recurrentData = params.getMap("recurrentData")?.let { recurrentInfo(it) }
            hideScanningCards = params.safeGetBoolean("hideScanningCards")

            merchantId = params.getString("googleMerchantId") ?: ""
            merchantName = params.getString("googleMerchantName") ?: ""
            isTestEnvironment = params.safeGetBoolean("googleIsTestEnvironment")
        }

        val mockMode = EcmpPaymentSDK.EcmpMockModeType.entries[params.getInt("mockModeType")]

        // Initialize SDK and open payment form
        val sdk = EcmpPaymentSDK(currentActivity.applicationContext, paymentOptions, mockMode)

        paymentPromise = promise

        val intent = sdk.intent
        currentActivity.startActivityForResult(intent, 1001)
    }

    @ReactMethod
    fun getParamsForSignature(params: ReadableMap): String  {
        val ecmpPaymentInfo = paymentInfo(params)

        return ecmpPaymentInfo.getParamsForSignature()
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

    private fun paymentInfo(map: ReadableMap): EcmpPaymentInfo {
        return EcmpPaymentInfo(
            projectId = map.getInt("projectID"),
            paymentId = map.getString("paymentID") ?: "",
            paymentAmount = map.getInt("paymentAmount").toLong(),
            paymentCurrency = map.getString("paymentCurrency") ?: "",
            paymentDescription = map.getString("paymentCurrency"),
            customerId = map.getString("customerID"),
            regionCode = map.getString("regionCode"),
            token = map.getString("token")
        )
    }

    private fun additionalField(map: ReadableMap): EcmpAdditionalField {
        val type = EcmpAdditionalFieldType.entries.find { it.value == map.getString("type") }
        val value = map.getString("value") ?: ""
        return EcmpAdditionalField(type, value)
    }

    private fun recipientInfo(map: ReadableMap): EcmpRecipientInfo {
        return EcmpRecipientInfo(
            walletOwner = map.getString("walletOwner"),
            walletId = map.getString("walletId"),
            country = map.getString("country"),
            pan = map.getString("pan"),
            cardHolder = map.getString("cardHolder"),
            address = map.getString("address"),
            city = map.getString("city"),
            stateCode = map.getString("stateCode")
        )
    }

    private fun recurrentInfo(map: ReadableMap): EcmpRecurrentData {
        val schedule = map.getArray("schedule")?.let { array ->
            mutableListOf<EcmpRecurrentDataSchedule>().apply {
                for (i in 0 until array.size()) {
                    add(recurrentInfoSchedule(array.getMap(i)))
                }
            }
        } ?: listOf()

        return EcmpRecurrentData(
            register = map.getBoolean("register"),
            type = map.getString("type"),
            expiryDay = map.getString("expiryDay"),
            expiryMonth = map.getString("expiryMonth"),
            expiryYear = map.getString("expiryYear"),
            period = map.getString("period"),
            interval = map.safeGetInt("interval"),
            time = map.getString("time"),
            startDate = map.getString("startDate"),
            scheduledPaymentID = map.getString("scheduledPaymentID"),
            amount = map.safeGetLong("amount"),
            schedule = schedule
        )
    }

    private fun recurrentInfoSchedule(map: ReadableMap): EcmpRecurrentDataSchedule {
        return EcmpRecurrentDataSchedule(
            date = map.getString("date"),
            amount = map.getLong("amount")
        )
    }
}

fun ReadableMap.safeGetBoolean(key: String): Boolean {
    return if (this.hasKey(key) && this.getType(key) == ReadableType.Boolean) {
        this.getBoolean(key)
    } else {
        false // Default value or handle missing field
    }
}

fun ReadableMap.safeGetLong(key: String): Long {
    return if (this.hasKey(key) && this.getType(key) == ReadableType.Number) {
        // Get the number and safely convert to Long
        this.getDouble(key).toLong()
    } else {
        0L // Default value
    }
}

fun ReadableMap.safeGetInt(key: String): Int {
    return if (this.hasKey(key) && this.getType(key) == ReadableType.Number) {
        this.getInt(key)
    } else {
        0 // Default value
    }
}