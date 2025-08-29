package com.msdkreactnative

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.ecommpay.msdk.ui.EcmpActionType
import com.ecommpay.msdk.ui.EcmpAdditionalField
import com.ecommpay.msdk.ui.EcmpPaymentOptions
import com.ecommpay.msdk.ui.Ecommpay
import com.ecommpay.msdk.ui.EcmpScreenDisplayMode
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.msdkreactnative.extensions.buildAdditionalField
import com.msdkreactnative.extensions.buildPaymentInfo
import com.msdkreactnative.extensions.buildRecipientInfo
import com.msdkreactnative.extensions.buildRecurrentInfo
import com.msdkreactnative.extensions.safeGetBoolean
import com.msdkreactnative.extensions.safeGetInt

class MsdkReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ActivityEventListener {

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
    promise: Promise,
  ) {
    val currentActivity = reactApplicationContext.currentActivity ?: return

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
              array.getMap(i)?.buildAdditionalField()?.let { add(it) }
            }
          }
        } ?: listOf<EcmpAdditionalField>()
      }

      screenDisplayModes {
        params.getArray("screenDisplayModes")?.let { array ->
          mutableSetOf<EcmpScreenDisplayMode>().apply {
            for (i in 0 until array.size()) {
              add(EcmpScreenDisplayMode.entries[array.getInt(i) - 1])
            }
          }
        } ?: emptySet<EcmpScreenDisplayMode>()
      }

      isDarkTheme = params.getBoolean("isDarkTheme")
      recipientInfo = params.getMap("recipientInfo")?.let { it.buildRecipientInfo() }
      recurrentData = params.getMap("recurrentData")?.let { it.buildRecurrentInfo() }
      hideScanningCards = params.safeGetBoolean("hideScanningCards")

      merchantId = params.getString("googleMerchantId") ?: ""
      merchantName = params.getString("googleMerchantName") ?: ""
      isTestEnvironment = params.safeGetBoolean("googleIsTestEnvironment")

      // Brand customization
      params.getString("primaryBrandColor")?.let { colorString ->
        primaryBrandColor = colorString
      }

      params.getString("secondaryBrandColor")?.let { colorString ->
        secondaryBrandColor = colorString
      }

      // Stored card type
      storedCardType = params.safeGetInt("storedCardType")
    }

    val mockMode = Ecommpay.EcmpMockModeType.entries[params.getInt("mockModeType")]

    // Initialize SDK and open payment form
    val sdk = Ecommpay(currentActivity.applicationContext, paymentOptions, mockMode)

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

  override fun onActivityResult(
    activity: Activity,
    requestCode: Int,
    resultCode: Int,
    data: Intent?,
  ) {
    when (resultCode) {
      Ecommpay.RESULT_SUCCESS -> {
        val paymentJson = data?.getStringExtra(Ecommpay.EXTRA_PAYMENT)
        val resultMap = Arguments.createMap()
        resultMap.putString("paymentJson", paymentJson)
        resultMap.putInt("resultCode", resultCode)
        paymentPromise?.resolve(resultMap)
      }

      Ecommpay.RESULT_ERROR -> {
        val errorCode = data?.getStringExtra(Ecommpay.EXTRA_ERROR_CODE)
        val errorMessage = data?.getStringExtra(Ecommpay.EXTRA_ERROR_MESSAGE)
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

  override fun onNewIntent(data: Intent) {}

}
