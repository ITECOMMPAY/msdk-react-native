//
//  PluginRecurrentData.swift
//  ecmpplugin
//
//  Created by Alex on 19.04.2024.
//

import Foundation
import EcommpaySDK

internal struct PluginRecurrentData: Decodable {
    let register: Bool
    let type: String?
    let expiryDay: String?
    let expiryMonth: String?
    let expiryYear: String?
    let period: String?
    let interval: Int?
    let time: String?
    let startDate: String?
    let scheduledPaymentID: String?
    let amount: Int64?
    let schedule: [PluginRecurrentDataSchedule]?
    
    func map() -> EcommpaySDK.RecurrentInfo {
        let recurrentType = EcommpaySDK.RecurrentType(rawValue: type ?? "")
        let recurrentPeriod = EcommpaySDK.RecurrentPeriod(rawValue: period)
        let mappedSchedule = schedule?.map { $0.map() } ?? []
        
        return EcommpaySDK.RecurrentInfo(
            register: register,
            type: recurrentType,
            expiryDay: expiryDay,
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            period: recurrentPeriod,
            interval: interval ?? 0,
            time: time,
            startDate: startDate,
            scheduledPaymentID: scheduledPaymentID,
            amount: amount != nil ? Int(amount!) : nil,
            schedule: mappedSchedule
        )
    }
}

internal struct PluginRecurrentDataSchedule: Decodable {
    let date: String
    let amount: Int
    
    func map() -> EcommpaySDK.RecurrentInfoSchedule {
        return EcommpaySDK.RecurrentInfoSchedule(
            date: date,
            amount: amount
        )
    }
}
