//
//  PluginAdditionalField.swift
//  ecmpplugin
//
//  Created by Alex on 18.04.2024.
//

import Foundation
import EcommpaySDK

internal struct PluginAdditionalField: Decodable {
    let type: String
    let value: String
    
    func map() -> AdditionalField {
        return AdditionalField(customName: type, value: value)
    }
}
