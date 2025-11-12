//
//  PluginPaymentOptions.swift
//  ecmpplugin
//
//  Created by Alex on 18.04.2024.
//

import Foundation
import EcommpaySDK
import React


internal enum PluginActionType: Int, Decodable {
  case Sale = 1
  case Auth = 2
  case Tokenize = 3
  case Verify = 4

    func map() ->  PaymentOptions.ActionType  {
        if (self == PluginActionType.Auth) {
            return PaymentOptions.ActionType.Auth
        } else if (self == PluginActionType.Tokenize) {
            return PaymentOptions.ActionType.Tokenize
        } else if (self == PluginActionType.Verify) {
            return PaymentOptions.ActionType.Verify
        } else {
            return PaymentOptions.ActionType.Sale
        }
    }
}

internal enum PluginMockModeType: Int, Decodable {
  case DISABLED, SUCCESS, DECLINE

  func map() -> MockModeType {
    switch self {
    case PluginMockModeType.SUCCESS:
      return MockModeType.success
    case PluginMockModeType.DECLINE:
      return MockModeType.decline
    case PluginMockModeType.DISABLED:
      return MockModeType.disabled
    }
  }
}

internal enum PluginScreenDisplayMode: Int, Decodable {
    case HIDE_SUCCESS_FINAL_SCREEN, HIDE_DECLINE_FINAL_SCREEN

    func map() -> ScreenDisplayMode  {
        if (self == PluginScreenDisplayMode.HIDE_SUCCESS_FINAL_SCREEN) {
            return ScreenDisplayMode.hideDeclineFinalPage
        } else {
            return ScreenDisplayMode.hideDeclineFinalPage
        }
    }
}


internal struct PluginPaymentOptions: Decodable {
    let actionType: PluginActionType
    let paymentInfo: PluginPaymentInfo
    let recurrentData: PluginRecurrentData?
    let recipientInfo: PluginRecipientInfo?
    let additionalFields: [PluginAdditionalField]?
    let screenDisplayModes: [PluginScreenDisplayMode]?
    let mockModeType: PluginMockModeType
    let hideScanningCards: Bool?
    let applePayMerchantId: String?
    let applePayDescription: String?
    let applePayCountryCode: String?
    let isDarkTheme: Bool?
    let primaryBrandColor: String?
    let secondaryBrandColor: String?
    let hideFooterLogo: Bool?
    let storedCardType: Int?
    let signature: String?

    func map() -> PaymentOptions {
        let sdkPaymentOptions = paymentInfo.mapToPaymentOption()

        sdkPaymentOptions.action = actionType.map()
        sdkPaymentOptions.isDarkThemeOn = isDarkTheme ?? false

        print("Selected mock type: \(mockModeType.map())")

        sdkPaymentOptions.mockModeType = mockModeType.map()


        // Screen display modes
        if let screenModes = screenDisplayModes {
            let modes = screenModes.map { $0.map() }
            sdkPaymentOptions.screenDisplayModes = Set(modes)
        }

        // Additional fields
        if let additionalFields = additionalFields {
            sdkPaymentOptions.additionalFields = additionalFields.map { $0.map() }
        }

        // Recipient info
        if let recipientInfo = recipientInfo {
            sdkPaymentOptions.recipientInfo = recipientInfo.map()
        }

        // Recurrent data
        if let recurrentData = recurrentData {
            sdkPaymentOptions.recurrentInfo = recurrentData.map()
        }

        // Payment options
        sdkPaymentOptions.hideScanningCards = hideScanningCards ?? false

        // Apple Pay
        if let applePayCountryCode = applePayCountryCode,
           let applePayMerchantId = applePayMerchantId,
           let applePayDescription = applePayDescription {
            sdkPaymentOptions.applePayOptions = PaymentOptions.ApplePayOptions(
                applePayMerchantID: applePayMerchantId,
                applePayDescription: applePayDescription,
                countryCode: applePayCountryCode
            )
        }

        // Brand customization
        if let primaryBrandColorString = primaryBrandColor {
            sdkPaymentOptions.primaryBrandColor = UIColor(hex: primaryBrandColorString)
        }

        if let secondaryBrandColorString = secondaryBrandColor {
            sdkPaymentOptions.secondaryBrandColor = UIColor(hex: secondaryBrandColorString)
        }

        if let hideFooterLogo = hideFooterLogo {
            sdkPaymentOptions.hideFooterLogo = hideFooterLogo
        }

        // Stored card type
        if let storedCardType = storedCardType {
            sdkPaymentOptions.storedCardType = NSNumber(value: storedCardType)
        }

        // Override signature if provided at top level
        if let topLevelSignature = signature {
            sdkPaymentOptions.signature = topLevelSignature
        }

        return sdkPaymentOptions
    }
}

// MARK: - RCTConvert Extensions
@objc(PaymentOptions)
class RCTConvertPluginPaymentOptions: RCTConvert {

    @objc static func buildPaymentOptionsFromInfo(_ json: NSDictionary) -> PaymentOptions {
      let jsonDict = json as! [String: Any]

      let jsonData = try! JSONSerialization.data(withJSONObject: jsonDict, options: [])

      let pluginPaymentInfo = try! JSONDecoder().decode(PluginPaymentInfo.self, from: jsonData)
      return pluginPaymentInfo.mapToPaymentOption()
    }

    @objc static func buildPaymentOptions(_ json: NSDictionary) -> PaymentOptions {
      let jsonDict = json as! [String: Any]

      let jsonData = try! JSONSerialization.data(withJSONObject: jsonDict, options: [])

      let pluginPaymentOptions = try! JSONDecoder().decode(PluginPaymentOptions.self, from: jsonData)
      return pluginPaymentOptions.map()
  }

}

extension UIColor {
    public convenience init?(hex: String) {
        let r, g, b, a: CGFloat

        if hex.hasPrefix("#") {
          let start = hex.index(hex.startIndex, offsetBy: 1)
          var hexColor = String(hex[start...])

          if hexColor.count < 8 {
            hexColor = hexColor + "ff"
          }
          
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
