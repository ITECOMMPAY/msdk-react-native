# MSDK React Native

![NPM Version](https://img.shields.io/npm/v/msdk-react-native)

React Native SDK for integrating payment capabilities into mobile applications.

## Installation

```sh
npm install msdk-react-native
```

or

```sh
yarn add msdk-react-native
```

## Import

```typescript
import {
  initializePayment,
  getParamsForSignature,
  type EcmpPaymentInfo,
  EcmpActionType,
  EcmpMockModeType,
  EcmpScreenDisplayMode,
  type EcmpAdditionalField,
  type EcmpRecipientInfo,
  type EcmpRecurrentData
} from 'msdk-react-native';
```

## Basic Usage

### 1. Create Payment Information Object

```typescript
const paymentInfoWithoutSignature: EcmpPaymentInfo = {
  projectID: "YOUR_PROJECT_ID",
  paymentID: "YOUR_PAYMENT_ID",
  paymentAmount: 100.50,
  paymentCurrency: 'USD',
  paymentDescription: 'Test payment',
  customerID: '12',
  regionCode: 'US',
  languageCode: 'en',
  hideSavedWallets: false,
  // Optional fields
  token: '',
  receiptData: ''
};
```

### 2. Generate Signature

```typescript
// Get parameters for signature
const paramsForSignature = await getParamsForSignature(paymentInfoWithoutSignature);

// Generate signature (use your secret key)
const signature = SignatureGenerator.generateSignature(paramsForSignature, "YOUR_SECRET_KEY");

// Create final object with signature
const paymentInfo: EcmpPaymentInfo = {
  ...paymentInfoWithoutSignature,
  signature: signature
};
```

### 3. Initialize Payment

```typescript
await initializePayment(
  {
    actionType: EcmpActionType.Sale,
    paymentInfo: paymentInfo,
    isDarkTheme: false,
    mockModeType: EcmpMockModeType.disabled
  },
  (result) => {
    console.log('Payment result:', result);
    // Handle payment result
  }
);
```

## Operation Types

```typescript
EcmpActionType.Sale      // Sale
EcmpActionType.Auth      // Authorization
EcmpActionType.Verify    // Verification
EcmpActionType.Tokenize  // Tokenization
```

## Additional Features

### Screen Display Settings

```typescript
const screenDisplayModes = [
  EcmpScreenDisplayMode.hideSuccessFinalPage,
  EcmpScreenDisplayMode.hideDeclineFinalPage
];
```

### Additional Fields

```typescript
const additionalFields: EcmpAdditionalField[] = [
  {
    type: 'field_type',
    value: 'field_value'
  }
];
```

### Recipient Information

```typescript
const recipientInfo: EcmpRecipientInfo = {
  walletOwner: 'John Doe',
  walletId: 'wallet123',
  country: 'US',
  pan: '1234567890123456',
  cardHolder: 'John Doe',
  address: '123 Main St',
  city: 'New York',
  stateCode: 'NY'
};
```

### Recurrent Payment Setup

```typescript
const recurrentData: EcmpRecurrentData = {
  register: true,
  type: 'monthly',
  expiryDay: '31',
  expiryMonth: '12',
  expiryYear: '2025',
  period: 'month',
  interval: 1,
  time: '10:00',
  startDate: '2024-01-01',
  scheduledPaymentID: 'schedule_123'
};
```

### Full Configuration

```typescript
await initializePayment(
  {
    actionType: EcmpActionType.Sale,
    paymentInfo: paymentInfo,
    isDarkTheme: false,
    mockModeType: EcmpMockModeType.disabled,
    screenDisplayModes: screenDisplayModes,
    additionalFields: additionalFields,
    recipientInfo: recipientInfo,
    recurrentData: recurrentData,
    hideScanningCards: true,
    brandColor: '#3498db',
    storedCardType: 0,
    // Google Pay
    googleMerchantId: 'merchant_id',
    googleMerchantName: 'Merchant Name',
    googleIsTestEnvironment: true,
    // Apple Pay
    applePayMerchantID: 'merchant.com.example',
    applePayDescription: 'Payment description',
    applePayCountryCode: 'US'
  },
  (result) => {
    console.log('Payment result:', result);
    // Handle result
  }
);
```

## Mock Modes

```typescript
EcmpMockModeType.disabled  // Disabled
EcmpMockModeType.success   // Always successful result
EcmpMockModeType.decline   // Always decline
```

## Result Handling

The callback function receives an object with payment result that contains information about operation status, error codes, and other data.
