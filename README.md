## Installation

```sh
npm install msdk-react-native

or

yarn install msdk-react-native
```

## Usage

```js
// 1. Create the EcmpPaymentInfo object

let paymentInfo: EcmpPaymentInfo = {
    projectID: 12123123,
    paymentID: "paymentId11",
    paymentAmount: 22200,
    paymentCurrency: "USD",
}

// 2. Sign the parameters contained in the EcmpPaymentInfo object

let paramsForSignature = getParamsForSignature(paymentInfo)
paymentInfo.signature = "CALCULATED_SIGNATURE_FROM_YOUR_BACKEND"

// 3. Create the EcmpPaymentOptions object that contains the required parameter actionType (enum) with the value specifying the required operation type

let paymentOptions: EcmpPaymentOptions = {
    actionType: EcmpActionType.Tokenize,
    paymentInfo: paymentInfo,
    isDarkTheme: true,
    //if need use real service- set EcmpMockModeType.disabled
    mockModeType: EcmpMockModeType.success,
    //set display mode if need
    screenDisplayModes: [EcmpScreenDisplayMode.hideDeclineFinalPage],
     //set additional fields if need
    additionalFields: [ {
      type: 'email',
      value: 'mail@mail.com'
    }]
}

// 4. Open the payment form and handle result

const handleResult = (result) => {
    console.log(result);
}

initializePayment(paymentOptions, handleResult)
```
