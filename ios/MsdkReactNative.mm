#import <React/RCTBridgeModule.h>
#import <EcommpaySDK/EcommpaySDK.h>

@interface RCT_EXTERN_MODULE(MsdkReactNative, NSObject)

RCT_EXTERN_METHOD(initializePaymentWithOptions:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getParamsForSignature:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
