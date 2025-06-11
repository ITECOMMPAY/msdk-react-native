import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'msdk-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const MsdkReactNative = NativeModules.MsdkReactNative
  ? NativeModules.MsdkReactNative
  : new Proxy(
      {},
      {
        get() {
          console.log(
            'NativeModules.MsdkReactNative',
            NativeModules.MsdkReactNative
          );
          throw new Error(LINKING_ERROR);
        },
      }
    );

export type EcmpPaymentInfo = {
  projectID: number;
  paymentID: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentDescription?: string;
  customerID?: string;
  regionCode?: string;
  token?: string;
  languageCode?: string;
  receiptData?: string;
  hideSavedWallets?: boolean;
  signature?: string;
};

export type EcmpPaymentOptions = {
  actionType: EcmpActionType;
  paymentInfo: EcmpPaymentInfo;
  isDarkTheme?: boolean;
  mockModeType: EcmpMockModeType;
  screenDisplayModes?: EcmpScreenDisplayMode[];
  additionalFields?: EcmpAdditionalField[];
  recipientInfo?: EcmpRecipientInfo;
  recurrentData?: EcmpRecurrentData;
  hideScanningCards?: boolean;
  googleMerchantId?: string;
  googleMerchantName?: string;
  googleIsTestEnvironment?: boolean;
  applePayMerchantID?: string;
  applePayDescription?: string;
  applePayCountryCode?: string;
  brandColor?: string;
  storedCardType?: number;
};

export enum EcmpActionType {
  Sale = 1,
  Auth = 2,
  Tokenize = 3,
  Verify = 4,
}

export enum EcmpMockModeType {
  disabled = 0,
  success = 1,
  decline = 2,
}

export enum EcmpScreenDisplayMode {
  hideSuccessFinalPage = 1,
  hideDeclineFinalPage = 2,
}

export type EcmpAdditionalField = {
  type: string;
  value: string;
};

export type EcmpRecurrentData = {
  register: boolean;
  type?: string;
  expiryDay?: string;
  expiryMonth?: string;
  expiryYear?: string;
  period?: string;
  interval?: number;
  time?: string;
  startDate?: string;
  scheduledPaymentID?: string;
  amount?: number;
  schedule?: EcmpRecurrentDataSchedule[];
};

export type EcmpRecurrentDataSchedule = {
  date?: string;
  amount?: bigint;
};

export type EcmpRecipientInfo = {
  walletOwner?: string;
  walletId?: string;
  country?: string;
  pan?: string;
  cardHolder?: string;
  address?: string;
  city?: string;
  stateCode?: string;
};

export const initializePayment = async (
  params: EcmpPaymentOptions,
  callback: (result: any) => void
) => {
  try {
    const result = await MsdkReactNative.initializePaymentWithOptions(params);
    callback(result);
  } catch (error) {
    callback(error);
  }
};

export const getParamsForSignature = (params: EcmpPaymentInfo): string => {
  return MsdkReactNative.getParamsForSignature(params);
};
