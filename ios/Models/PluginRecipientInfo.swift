//
//  PluginRecipientInfo.swift
//  ecmpplugin
//
//  Created by Alex on 19.04.2024.
//

import Foundation
import EcommpaySDK

internal struct PluginRecipientInfo: Decodable {
    let walletOwner: String?
    let walletId: String?
    let country: String?
    let pan: String?
    let cardHolder: String?
    let address: String?
    let city: String?
    let stateCode: String?
    
    func map() -> RecipientInfo {
        return RecipientInfo(walletId: walletId,
                             walletOwner: walletOwner,
                             pan: pan,
                             cardHolder: cardHolder,
                             country: country,
                             stateCode: stateCode,
                             city: city,
                             address: address
        )
    }
}
