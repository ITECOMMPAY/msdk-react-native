import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Switch,
  useColorScheme
} from 'react-native';
import {
  initializePayment,
  type EcmpPaymentInfo,
  EcmpActionType,
  EcmpMockModeType,
  EcmpScreenDisplayMode,
  type EcmpAdditionalField,
  type EcmpRecipientInfo,
  type EcmpRecurrentData,
  getParamsForSignature
} from 'msdk-react-native';
import SignatureGenerator from '../../src/index';

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [paymentResult, setPaymentResult] = useState<string>('');

  // Payment Info State
  const [projectID, setProjectID] = useState<string>('138723');
  const [paymentID, setPaymentID] = useState<string>('sdk_sample_ui_' + Math.random().toString(36).substring(2, 9));
  const [paymentAmount, setPaymentAmount] = useState<string>('100.50');
  const [paymentCurrency, setPaymentCurrency] = useState<string>('USD');
  const [paymentDescription, setPaymentDescription] = useState<string>('Test payment');
  const [customerID, setCustomerID] = useState<string>('12');
  const [regionCode, setRegionCode] = useState<string>('US');
  const [token, setToken] = useState<string>('');
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [receiptData, setReceiptData] = useState<string>('');
  const [secret, setSecret] = useState<string>('secret key');

  // Payment Options State
  const [actionType, setActionType] = useState<EcmpActionType>(EcmpActionType.Sale);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [mockModeType, setMockModeType] = useState<EcmpMockModeType>(EcmpMockModeType.disabled);
  const [hideScanningCards, setHideScanningCards] = useState<boolean>(true);
  const [hideSavedWallets, setHideSavedWallets] = useState<boolean>(false);
  const [brandColor, setBrandColor] = useState<string>('#3498db');
  const [storedCardType, setStoredCardType] = useState<string>('');

  // Screen Display Modes
  const [hideSuccessFinalPage, setHideSuccessFinalPage] = useState<boolean>(false);
  const [hideDeclineFinalPage, setHideDeclineFinalPage] = useState<boolean>(false);

  // Google Pay
  const [googleMerchantId, setGoogleMerchantId] = useState<string>('');
  const [googleMerchantName, setGoogleMerchantName] = useState<string>('');
  const [googleIsTestEnvironment, setGoogleIsTestEnvironment] = useState<boolean>(true);

  // Apple Pay
  const [applePayMerchantID, setApplePayMerchantID] = useState<string>('');
  const [applePayDescription, setApplePayDescription] = useState<string>('');
  const [applePayCountryCode, setApplePayCountryCode] = useState<string>('US');

  // Additional Fields
  const [additionalFieldType, setAdditionalFieldType] = useState<string>('');
  const [additionalFieldValue, setAdditionalFieldValue] = useState<string>('');
  const [additionalFields, setAdditionalFields] = useState<EcmpAdditionalField[]>([]);

  // Recipient Info
  const [showRecipientInfo, setShowRecipientInfo] = useState<boolean>(false);
  const [walletOwner, setWalletOwner] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [recipientCountry, setRecipientCountry] = useState<string>('');
  const [pan, setPan] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateCode, setStateCode] = useState<string>('');

  // Recurrent Data
  const [showRecurrentData, setShowRecurrentData] = useState<boolean>(false);
  const [recurrentRegister, setRecurrentRegister] = useState<boolean>(false);
  const [recurrentType, setRecurrentType] = useState<string>('');
  const [expiryDay, setExpiryDay] = useState<string>('');
  const [expiryMonth, setExpiryMonth] = useState<string>('');
  const [expiryYear, setExpiryYear] = useState<string>('');
  const [period, setPeriod] = useState<string>('');
  const [interval, setInterval] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [scheduledPaymentID, setScheduledPaymentID] = useState<string>('');

  const addAdditionalField = () => {
    if (additionalFieldType && additionalFieldValue) {
      setAdditionalFields([...additionalFields, {
        type: additionalFieldType,
        value: additionalFieldValue
      }]);
      setAdditionalFieldType('');
      setAdditionalFieldValue('');
    }
  };

  const removeAdditionalField = (index: number) => {
    setAdditionalFields(additionalFields.filter((_, i) => i !== index));
  };

  const handlePayment = async (paymentActionType: EcmpActionType) => {
    try {
      const paymentInfoWithoutSignature: EcmpPaymentInfo = {
        projectID: parseInt(projectID) || 0,
        paymentID: paymentID,
        paymentAmount: parseFloat(paymentAmount) || 0,
        paymentCurrency: paymentCurrency,
        paymentDescription: paymentDescription || undefined,
        customerID: customerID || undefined,
        regionCode: regionCode || undefined,
        token: token || undefined,
        languageCode: languageCode || undefined,
        receiptData: receiptData || undefined,
        hideSavedWallets: hideSavedWallets,
      };

      const paramsForSignature = await getParamsForSignature(paymentInfoWithoutSignature);


      const signature = SignatureGenerator.generateSignature(paramsForSignature, secret);

      const paymentInfo = {
        projectID: parseInt(projectID) || 0,
        paymentID: paymentID,
        paymentAmount: parseFloat(paymentAmount) || 0,
        paymentCurrency: paymentCurrency,
        paymentDescription: paymentDescription || undefined,
        customerID: customerID || undefined,
        regionCode: regionCode || undefined,
        token: token || undefined,
        languageCode: languageCode || undefined,
        receiptData: receiptData || undefined,
        hideSavedWallets: hideSavedWallets,
        signature: signature
      }

      const screenDisplayModes = [];
      if (hideSuccessFinalPage) screenDisplayModes.push(EcmpScreenDisplayMode.hideSuccessFinalPage);
      if (hideDeclineFinalPage) screenDisplayModes.push(EcmpScreenDisplayMode.hideDeclineFinalPage);

      const recipientInfo: EcmpRecipientInfo | undefined = showRecipientInfo ? {
        walletOwner: walletOwner || undefined,
        walletId: walletId || undefined,
        country: recipientCountry || undefined,
        pan: pan || undefined,
        cardHolder: cardHolder || undefined,
        address: address || undefined,
        city: city || undefined,
        stateCode: stateCode || undefined
      } : undefined;

      const recurrentData: EcmpRecurrentData | undefined = showRecurrentData ? {
        register: recurrentRegister,
        type: recurrentType || undefined,
        expiryDay: expiryDay || undefined,
        expiryMonth: expiryMonth || undefined,
        expiryYear: expiryYear || undefined,
        period: period || undefined,
        interval: parseInt(interval) || undefined,
        time: time || undefined,
        startDate: startDate || undefined,
        scheduledPaymentID: scheduledPaymentID || undefined
      } : undefined;

      await initializePayment(
        {
          actionType: paymentActionType,
          paymentInfo,
          isDarkTheme,
          mockModeType,
          screenDisplayModes: screenDisplayModes.length > 0 ? screenDisplayModes : undefined,
          additionalFields: additionalFields.length > 0 ? additionalFields : undefined,
          recipientInfo,
          recurrentData,
          hideScanningCards,
          googleMerchantId: googleMerchantId || undefined,
          googleMerchantName: googleMerchantName || undefined,
          googleIsTestEnvironment,
          applePayMerchantID: applePayMerchantID || undefined,
          applePayDescription: applePayDescription || undefined,
          applePayCountryCode: applePayCountryCode || undefined,
          brandColor,
          storedCardType: parseInt(storedCardType) || undefined
        },
        (result) => {
          console.log('Payment result:', result);
          setPaymentResult(JSON.stringify(result, null, 2));
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentResult('Error: ' + (error as Error).message);
    }
  };

  const dynamicStyles = createDynamicStyles(isDark);

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Payment SDK Configuration</Text>

      {/* Project Settings */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Project Settings</Text>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Project ID"
          value={projectID}
          onChangeText={setProjectID}
          keyboardType="numeric"
        />
      </View>

      {/* Payment Info */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Payment Information</Text>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Payment ID"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={paymentID}
          onChangeText={setPaymentID}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Payment Amount"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={paymentAmount}
          onChangeText={setPaymentAmount}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Payment Currency (USD, EUR, etc.)"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={paymentCurrency}
          onChangeText={setPaymentCurrency}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Payment Description"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={paymentDescription}
          onChangeText={setPaymentDescription}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Customer ID"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={customerID}
          onChangeText={setCustomerID}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Region Code (US, EU, etc.)"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={regionCode}
          onChangeText={setRegionCode}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Language Code (en, ru, etc.)"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={languageCode}
          onChangeText={setLanguageCode}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Token"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={token}
          onChangeText={setToken}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Receipt Data"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={receiptData}
          onChangeText={setReceiptData}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Secret"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={secret}
          onChangeText={setSecret}
        />
      </View>

      {/* Payment Options */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Payment Options</Text>

        <TextInput
          style={dynamicStyles.input}
          placeholder="Stored Card Type (0-6)"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={storedCardType}
          onChangeText={setStoredCardType}
          keyboardType="numeric"
        />

        <TextInput
          style={dynamicStyles.input}
          placeholder="Brand Color (#hex)"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={brandColor}
          onChangeText={setBrandColor}
        />

        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.switchLabel}>Dark Theme</Text>
          <Switch value={isDarkTheme} onValueChange={setIsDarkTheme} />
        </View>

        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.switchLabel}>Hide Saved Wallets</Text>
          <Switch value={hideSavedWallets} onValueChange={setHideSavedWallets} />
        </View>

        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.switchLabel}>Hide Scanning Cards</Text>
          <Switch value={hideScanningCards} onValueChange={setHideScanningCards} />
        </View>

        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.switchLabel}>Hide Success Final Page</Text>
          <Switch value={hideSuccessFinalPage} onValueChange={setHideSuccessFinalPage} />
        </View>

        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.switchLabel}>Hide Decline Final Page</Text>
          <Switch value={hideDeclineFinalPage} onValueChange={setHideDeclineFinalPage} />
        </View>
      </View>

      {/* Mock Mode */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Mock Mode</Text>
        <View style={dynamicStyles.buttonGroup}>
          <Button
            title="Disabled"
            onPress={() => setMockModeType(EcmpMockModeType.disabled)}
            color={mockModeType === EcmpMockModeType.disabled ? '#007AFF' : '#8E8E93'}
          />
          <Button
            title="Success"
            onPress={() => setMockModeType(EcmpMockModeType.success)}
            color={mockModeType === EcmpMockModeType.success ? '#007AFF' : '#8E8E93'}
          />
          <Button
            title="Decline"
            onPress={() => setMockModeType(EcmpMockModeType.decline)}
            color={mockModeType === EcmpMockModeType.decline ? '#007AFF' : '#8E8E93'}
          />
        </View>
      </View>

      {/* Google Pay */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Google Pay</Text>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Google Merchant ID"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={googleMerchantId}
          onChangeText={setGoogleMerchantId}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Google Merchant Name"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={googleMerchantName}
          onChangeText={setGoogleMerchantName}
        />
        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.switchLabel}>Google Test Environment</Text>
          <Switch value={googleIsTestEnvironment} onValueChange={setGoogleIsTestEnvironment} />
        </View>
      </View>

      {/* Apple Pay */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Apple Pay</Text>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Apple Pay Merchant ID"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={applePayMerchantID}
          onChangeText={setApplePayMerchantID}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Apple Pay Description"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={applePayDescription}
          onChangeText={setApplePayDescription}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Apple Pay Country Code"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={applePayCountryCode}
          onChangeText={setApplePayCountryCode}
        />
      </View>

      {/* Additional Fields */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Additional Fields</Text>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Field Type"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={additionalFieldType}
          onChangeText={setAdditionalFieldType}
        />
        <TextInput
          style={dynamicStyles.input}
          placeholder="Field Value"
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          value={additionalFieldValue}
          onChangeText={setAdditionalFieldValue}
        />
        <Button title="Add Field" onPress={addAdditionalField} />

        {additionalFields.map((field, index) => (
          <View key={index} style={dynamicStyles.fieldRow}>
            <Text style={dynamicStyles.fieldText}>{field.type}: {field.value}</Text>
            <Button title="Remove" onPress={() => removeAdditionalField(index)} color="#FF3B30" />
          </View>
        ))}
      </View>

      {/* Recipient Info */}
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.sectionTitle}>Recipient Information</Text>
          <Switch value={showRecipientInfo} onValueChange={setShowRecipientInfo} />
        </View>

        {showRecipientInfo && (
          <>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Wallet Owner"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={walletOwner}
              onChangeText={setWalletOwner}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Wallet ID"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={walletId}
              onChangeText={setWalletId}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Country"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={recipientCountry}
              onChangeText={setRecipientCountry}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="PAN"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={pan}
              onChangeText={setPan}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Card Holder"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={cardHolder}
              onChangeText={setCardHolder}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Address"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="City"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="State Code"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={stateCode}
              onChangeText={setStateCode}
            />
          </>
        )}
      </View>

      {/* Recurrent Data */}
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.switchRow}>
          <Text style={dynamicStyles.sectionTitle}>Recurrent Data</Text>
          <Switch value={showRecurrentData} onValueChange={setShowRecurrentData} />
        </View>

        {showRecurrentData && (
          <>
            <View style={dynamicStyles.switchRow}>
              <Text style={dynamicStyles.switchLabel}>Register for Recurrent</Text>
              <Switch value={recurrentRegister} onValueChange={setRecurrentRegister} />
            </View>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Recurrent Type"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={recurrentType}
              onChangeText={setRecurrentType}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Expiry Day"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={expiryDay}
              onChangeText={setExpiryDay}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Expiry Month"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={expiryMonth}
              onChangeText={setExpiryMonth}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Expiry Year"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={expiryYear}
              onChangeText={setExpiryYear}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Period"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={period}
              onChangeText={setPeriod}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Interval"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={interval}
              onChangeText={setInterval}
              keyboardType="numeric"
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Time"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={time}
              onChangeText={setTime}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Start Date"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Scheduled Payment ID"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              value={scheduledPaymentID}
              onChangeText={setScheduledPaymentID}
            />
          </>
        )}
      </View>

      {/* Payment Action Buttons */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Payment Actions</Text>
        <View style={dynamicStyles.buttonGroup}>
          <Button
            title="Sale"
            onPress={() => handlePayment(EcmpActionType.Sale)}
            color="#34C759"
          />
          <Button
            title="Auth"
            onPress={() => handlePayment(EcmpActionType.Auth)}
            color="#007AFF"
          />
          <Button
            title="Verify"
            onPress={() => handlePayment(EcmpActionType.Verify)}
            color="#FF9500"
          />
          <Button
            title="Tokenize"
            onPress={() => handlePayment(EcmpActionType.Tokenize)}
            color="#5856D6"
          />
        </View>
      </View>

      {/* Payment Result */}
      {paymentResult ? (
        <View style={dynamicStyles.resultContainer}>
          <Text style={dynamicStyles.resultTitle}>Payment Result:</Text>
          <Text style={dynamicStyles.resultText}>{paymentResult}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const createDynamicStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000' : '#f5f5f5',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: isDark ? '#fff' : '#333'
  },
  section: {
    backgroundColor: isDark ? '#1c1c1e' : '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: isDark ? '#fff' : '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? '#3a3a3c' : '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: isDark ? '#2c2c2e' : '#fff',
    color: isDark ? '#fff' : '#000',
    placeholderTextColor: isDark ? '#8e8e93' : '#999'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8
  },
  switchLabel: {
    fontSize: 16,
    color: isDark ? '#fff' : '#333',
    flex: 1
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: isDark ? '#2c2c2e' : '#f8f8f8',
    borderRadius: 6,
    marginBottom: 8
  },
  fieldText: {
    flex: 1,
    fontSize: 14,
    color: isDark ? '#fff' : '#333'
  },
  resultContainer: {
    backgroundColor: isDark ? '#1c1c1e' : '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: isDark ? '#fff' : '#333'
  },
  resultText: {
    fontSize: 14,
    color: isDark ? '#8e8e93' : '#666',
    fontFamily: 'monospace'
  }
});
