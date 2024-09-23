import React
import ecommpaySDK

@objc(MsdkReactNative)
class MsdkReactNative: NSObject {

  @objc
  func initializePaymentWithOptions(_ options: NSDictionary) {
    let sdkFacade: EcommpaySDK = EcommpaySDK()
    let paymentOptions: PaymentOptions = RCTConvertPaymentOptions.PaymentOptions(options as! [String: Any])
    
    DispatchQueue.main.async {
      if let rootVC = UIApplication.shared.keyWindow?.rootViewController {
        sdkFacade.presentPayment(at: rootVC, paymentOptions: paymentOptions) { (result) in
          print("ECommPay SDK finished with status \(result.status.rawValue)")
        }
      }
    }
  }
  
  @objc
  func getParamsForSignature(_ options: NSDictionary) -> String {
    let paymentOptions: PaymentOptions = RCTConvertPaymentOptions.PaymentOptions(options as! [String: Any])
    
    return paymentOptions.paramsForSignature
  }
}
