package com.msdkreactnative.extensions

import com.ecommpay.msdk.ui.EcmpPaymentInfo
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.Arguments
import com.ecommpay.msdk.ui.EcmpActionType
import com.ecommpay.msdk.ui.EcmpAdditionalField
import com.ecommpay.msdk.ui.EcmpAdditionalFieldType
import com.ecommpay.msdk.ui.EcmpRecipientInfo
import com.ecommpay.msdk.ui.EcmpRecurrentData
import com.ecommpay.msdk.ui.EcmpRecurrentDataSchedule
import com.ecommpay.msdk.ui.EcmpScreenDisplayMode


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

fun ReadableMap.buildPaymentInfo(): EcmpPaymentInfo {
  val signature = getString("signature")
  android.util.Log.d("PaymentInfo", "Signature from JS: $signature")

  return EcmpPaymentInfo(
    projectId = getInt("projectID"),
    paymentId = getString("paymentID") ?: "",
    paymentAmount = (getDouble("paymentAmount") * 100).toLong(), // Convert to cents
    paymentCurrency = getString("paymentCurrency") ?: "",
    paymentDescription = getString("paymentDescription"),
    customerId = getString("customerID"),
    regionCode = getString("regionCode"),
    token = getString("token"),
    languageCode = getString("languageCode"),
    receiptData = getString("receiptData"),
    hideSavedWallets = safeGetBoolean("hideSavedWallets"),
    signature = signature,
  )
}

fun ReadableMap.buildAdditionalField(): EcmpAdditionalField {
  val type = EcmpAdditionalFieldType.entries.find { it.value == getString("type") }
  val value = getString("value") ?: ""
  return EcmpAdditionalField(type, value)
}


fun ReadableMap.buildRecipientInfo(): EcmpRecipientInfo =
  EcmpRecipientInfo(
    walletOwner = getString("walletOwner"),
    walletId = getString("walletId"),
    country = getString("country"),
    pan = getString("pan"),
    cardHolder = getString("cardHolder"),
    address = getString("address"),
    city = getString("city"),
    stateCode = getString("stateCode")
  )

fun ReadableMap.buildRecurrentInfo(): EcmpRecurrentData {
  val schedule = getArray("schedule")?.let { array ->
    mutableListOf<EcmpRecurrentDataSchedule>().apply {
      for (i in 0 until array.size()) {
        array.getMap(i)?.buildRecurrentInfoSchedule()?.let { add(it) }
      }
    }
  } ?: listOf()

  return EcmpRecurrentData(
    register = getBoolean("register"),
    type = getString("type"),
    expiryDay = getString("expiryDay"),
    expiryMonth = getString("expiryMonth"),
    expiryYear = getString("expiryYear"),
    period = getString("period"),
    interval = safeGetInt("interval"),
    time = getString("time"),
    startDate = getString("startDate"),
    scheduledPaymentID = getString("scheduledPaymentID"),
    amount = safeGetLong("amount"),
    schedule = schedule
  )
}

fun ReadableMap.buildRecurrentInfoSchedule(): EcmpRecurrentDataSchedule =
  EcmpRecurrentDataSchedule(
    date = getString("date"),
    amount = getLong("amount")
  )
