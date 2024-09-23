import React
import ecommpaySDK

@objc(PaymentOptions)
class RCTConvertPaymentOptions: RCTConvert {
  @objc static func PaymentInfo(_ json: [String: Any]) -> PaymentOptions {
    let projectID = RCTConvert.nsInteger(json["projectID"])
    let paymentID = RCTConvert.nsString(json["paymentID"]) ?? ""
    let paymentAmount = RCTConvert.int64_t(json["paymentAmount"])
    let paymentCurrency = RCTConvert.nsString(json["paymentCurrency"]) ?? ""
    let paymentDescription = RCTConvert.nsString(json["paymentDescription"])
    let customerID = RCTConvert.nsString(json["customerID"])
    let regionCode = RCTConvert.nsString(json["regionCode"])
    let token = RCTConvert.nsString(json["token"])
    
    let languageCode = RCTConvert.nsString("languageCode")
    let receiptData = RCTConvert.nsString(json["receiptData"])
    let forcePaymentMethod = RCTConvert.nsString(json["forcePaymentMethod"])
    let hideSavedWallets = RCTConvert.bool(json["hideSavedWallets"])
    let signature = RCTConvert.nsString(json["signature"])
    
    let paymentOptions = ecommpaySDK.PaymentOptions(projectID: Int32(projectID),
                                                    paymentID: paymentID,
                                                    paymentAmount: paymentAmount,
                                                    paymentCurrency: paymentCurrency,
                                                    paymentDescription: paymentDescription,
                                                    customerID: customerID,
                                                    regionCode: regionCode,
                                                    token: token)
    
    paymentOptions.languageCode = languageCode
    paymentOptions.receiptData = receiptData
    paymentOptions.forcePaymentMethod = forcePaymentMethod
    paymentOptions.hideSavedWallets = hideSavedWallets
    paymentOptions.signature = signature
    
    return paymentOptions
  }
  
  @objc static func AdditionalField(_ json: [String: Any]) -> ecommpaySDK.AdditionalField {
    let type = json["type"] as? String ?? ""
    let value = json["value"] as? String ?? ""
    
    return ecommpaySDK.AdditionalField(customName: type, value: value)
  }
  
  static func RecipientInfo(_ json: [String: Any]) -> ecommpaySDK.RecipientInfo {
    let walletOwner = json["walletOwner"] as? String
    let walletId = json["walletId"] as? String
    let country = json["country"] as? String
    let pan = json["pan"] as? String
    let cardHolder = json["cardHolder"] as? String
    let address = json["address"] as? String
    let city = json["city"] as? String
    let stateCode = json["stateCode"] as? String
    
    return ecommpaySDK.RecipientInfo(walletId: walletId,
                                     walletOwner: walletOwner,
                                     pan: pan,
                                     cardHolder: cardHolder,
                                     country: country,
                                     stateCode: stateCode,
                                     city: city,
                                     address: address
    )
                                     
  }
  
  @objc static func ReccurentData(_ json: [String: Any]) -> ecommpaySDK.RecurrentInfo {
    let register = RCTConvert.bool(json["register"])
    let type = ecommpaySDK.RecurrentType(rawValue: json["type"] as? String ?? "")
    let expiryDay = RCTConvert.nsString(json["expiryDay"])
    let expiryMonth = RCTConvert.nsString(json["expiryMonth"])
    let expiryYear = RCTConvert.nsString(json["expiryYear"])
    let period = ecommpaySDK.RecurrentPeriod(rawValue: json["period"] as? String)
    let interval = RCTConvert.nsInteger(json["interval"])
    let time = RCTConvert.nsString(json["time"])
    let startDate = RCTConvert.nsString(json["startDate"])
    let scheduledPaymentID = RCTConvert.nsString(json["scheduledPaymentID"])
    let amount = json["amount"] as? Int
    let schedule = (json["schedule"] as? [[String: Any]] ?? []).map { RecurrentInfoSchedule($0) }
    
    return ecommpaySDK.RecurrentInfo(
      register: register,
      type: type,
      expiryDay: expiryDay,
      expiryMonth: expiryMonth,
      expiryYear: expiryYear,
      period: period,
      interval: interval,
      time: time,
      startDate: startDate,
      scheduledPaymentID: scheduledPaymentID,
      amount: amount,
      schedule: schedule
    )
  }
  
  @objc static func RecurrentInfoSchedule(_ json: [String: Any]) -> ecommpaySDK.RecurrentInfoSchedule {
    let date = RCTConvert.nsString(json["date"]) ?? ""
    let amount = RCTConvert.nsInteger(json["amount"])
    
    return ecommpaySDK.RecurrentInfoSchedule(
      date: date,
      amount: amount
    )
  }
  
  @objc static func ApplePayOptions(applePayMerchantIDJson: String?, applePayDescriptionJson: String?, applePayCountryCodeJson: String?) -> ecommpaySDK.PaymentOptions.ApplePayOptions? {
    
    if let applePayCountryCode = applePayCountryCodeJson,
       let applePayMerchantId = applePayMerchantIDJson,
       let applePayDescription = applePayDescriptionJson {
      return ecommpaySDK.PaymentOptions.ApplePayOptions(applePayMerchantID: applePayMerchantId,
                                                applePayDescription: applePayDescription,
                                                countryCode: applePayCountryCode)
    }
    
    return nil
  }
  
  @objc static func PaymentOptions(_ json: [String: Any]) -> PaymentOptions {
    let paymentOptions = PaymentInfo(json["paymentInfo"] as? [String: Any] ?? [:])
    
    if let action = json["actionType"] as? Int {
      paymentOptions.action = ecommpaySDK.PaymentOptions.ActionType(rawValue: json["actionType"] as! Int) ?? .Auth
      paymentOptions.isDarkThemeOn = RCTConvert.bool(json["isDarkTheme"])
      paymentOptions.mockModeType = ecommpaySDK.MockModeType(rawValue: json["mockModeType"] as! Int) ?? .disabled
      paymentOptions.screenDisplayModes = json["screenDisplayModes"] as? Set<ScreenDisplayMode> ?? []
      paymentOptions.additionalFields = (json["additionalFields"] as? [[String: Any]] ?? []).map { AdditionalField($0) }
      paymentOptions.recipientInfo = RecipientInfo(json["recipientInfo"] as? [String : Any] ?? [:])
      paymentOptions.recurrentInfo = ReccurentData(json["recurrentData"] as? [String : Any] ?? [:])
      paymentOptions.hideScanningCards = json["hideScanningCards"] as? Bool ?? false
      paymentOptions.applePayOptions = ApplePayOptions(applePayMerchantIDJson: json["applePayMerchantID"] as? String,
                                                       applePayDescriptionJson: json["applePayDescription"] as? String,
                                                       applePayCountryCodeJson: json["applePayCountryCode"] as? String)
      paymentOptions.brandColor = json["brandColor"] != nil ? UIColor(hex: json["brandColor"] as! String) : nil
      paymentOptions.storedCardType = json["storedCardType"] as? NSNumber
    }
    
    return paymentOptions
  }
}

extension UIColor {
    public convenience init?(hex: String) {
        let r, g, b, a: CGFloat

        if hex.hasPrefix("#") {
            let start = hex.index(hex.startIndex, offsetBy: 1)
            let hexColor = String(hex[start...])

            if hexColor.count == 8 {
                let scanner = Scanner(string: hexColor)
                var hexNumber: UInt64 = 0

                if scanner.scanHexInt64(&hexNumber) {
                    r = CGFloat((hexNumber & 0xff000000) >> 24) / 255
                    g = CGFloat((hexNumber & 0x00ff0000) >> 16) / 255
                    b = CGFloat((hexNumber & 0x0000ff00) >> 8) / 255
                    a = CGFloat(hexNumber & 0x000000ff) / 255

                    self.init(red: r, green: g, blue: b, alpha: a)
                    return
                }
            }
        }

        return nil
    }
}
