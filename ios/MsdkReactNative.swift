import React
import ecommpaySDK

@objc(MsdkReactNative)
class MsdkReactNative: NSObject {
    
    @objc
    func initializePaymentWithOptions(_ options: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        let sdkFacade: EcommpaySDK = EcommpaySDK()
        let paymentOptions: PaymentOptions = RCTConvertPaymentOptions.PaymentOptions(options as! [String: Any])
        
        DispatchQueue.main.async {
            if let rootVC = UIApplication.shared.keyWindow?.rootViewController {
                sdkFacade.presentPayment(at: rootVC, paymentOptions: paymentOptions) { (result) in
                    sdkFacade.presentPayment(at: rootVC, paymentOptions: paymentOptions) { (result) in
                        
                        resolver(self.mapPaymentResult(result: result))
                    }
                }
            }
        }
    }
    
    @objc
    func getParamsForSignature(_ options: NSDictionary) -> String {
        let paymentOptions: PaymentOptions = RCTConvertPaymentOptions.PaymentOptions(options as! [String: Any])
        
        return paymentOptions.paramsForSignature
    }
    
    private func mapPaymentResult(result: PaymentResult) -> [String: Any] {
        let paymentDict: [String : Any] = [
            "id": result.payment?.id ?? "",
            "status": result.payment?.status ?? "",
            "method": result.payment?.method ?? "",
            "sum": result.payment?.sum ?? "",
            "type": result.payment?.type ?? "",
            "token": result.payment?.token ?? "",
            "currency": result.payment?.currency ?? "",
        ]
        
        let resultDict: [String : Any] = [
            "resultCode": result.status.rawValue,
            "errorCode": result.error?.codeString ?? "",
            "errorMessage": result.error?.message ?? "",
            "payment": paymentDict
        ]
        
        return resultDict
    }
}
