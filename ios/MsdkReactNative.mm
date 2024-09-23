#import <React/RCTBridgeModule.h>
#import <EcommpaySDK/EcommpaySDK.h>

@interface RCT_EXTERN_MODULE(MsdkReactNative, NSObject)

RCT_EXTERN_METHOD(initializePaymentWithOptions:(NSDictionary *)options)
RCT_EXTERN_METHOD(getParamsForSignature:(NSDictionary *))

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
