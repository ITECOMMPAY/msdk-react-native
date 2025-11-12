//
//  PluginPaymentInfo.swift
//  ecmpplugin
//
//  Created by Alex on 18.04.2024.
//

import Foundation
import EcommpaySDK

internal struct PluginPaymentInfo: Decodable {
    let projectID: Int32
    let paymentID: String
    let paymentAmount: Double
    let paymentCurrency: String
    let paymentDescription: String?
    let customerID: String?
    let regionCode: String?
    let token: String?
    let languageCode: String?
    let receiptData: String?
    let forcePaymentMethod: String?
    let hideSavedWallets: Bool?
    let signature: String?
    
    func mapToPaymentOption() -> PaymentOptions {
        let paymentOptions = PaymentOptions(projectID: projectID,
                                            paymentID: paymentID,
                                            paymentAmount: Int64((paymentAmount * 100).rounded()),
                                            paymentCurrency: paymentCurrency,
                                            paymentDescription: paymentDescription,
                                            customerID: customerID,
                                            regionCode: regionCode,
                                            token: token)
        paymentOptions.receiptData = receiptData
        paymentOptions.languageCode = languageCode
        paymentOptions.forcePaymentMethod = forcePaymentMethod
        paymentOptions.hideSavedWallets = hideSavedWallets ?? false
        paymentOptions.signature = signature
        
        return paymentOptions
    }
}
