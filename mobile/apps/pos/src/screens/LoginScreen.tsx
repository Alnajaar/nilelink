import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView,
  StatusBar, TextInput, Alert, ScrollView, Modal,
  Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { posActions } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import { PhoneNumberUtil } from 'google-libphonenumber';

const { width, height } = Dimensions.get('window');

const phoneUtil = PhoneNumberUtil.getInstance();

const COUNTRY_CODES = [
  { code: '+20', country: '🇪🇬 Egypt' },
  { code: '+1', country: '🇺🇸 USA' },
  { code: '+44', country: '🇬🇧 UK' },
  { code: '+971', country: '🇦🇪 UAE' },
];

export function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verification' | 'biometric'>('phone');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(30);
  const [availableRestaurants] = useState([
    { id: 'rest1', name: 'Cairo Kitchen', location: 'Downtown Cairo' },
    { id: 'rest2', name: 'Nile Grill', location: 'Zamalek' },
    { id: 'rest3', name: 'Pyramid Bistro', location: 'Giza' },
  ]);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Login to NileLink POS',
          fallbackLabel: 'Use phone credentials',
        });
        
        if (result.success) {
          navigateToRestaurantSelection();
        }
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
    }
  };

  const validatePhoneNumber = (number: string, code: string) => {
    try {
      const fullNumber = code + number.replace(/^0+/, '');
      const parsed = phoneUtil.parse(fullNumber);
      return phoneUtil.isValidNumber(parsed);
    } catch (error) {
      return false;
    }
  };

  const handlePhoneSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber, countryCode)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('verification');
      setTimer(30);
      setCanResend(false);
      Alert.alert('Code Sent', `Verification code sent to ${countryCode} ${phoneNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        setStep('biometric');
        // Setup biometric for future logins
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigateToRestaurantSelection();
      } else {
        navigateToRestaurantSelection();
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCanResend(false);
    setTimer(30);
    
    // Simulate resending code
    await new Promise(resolve => setTimeout(resolve, 1000));
    Alert.alert('Code Resent', 'A new verification code has been sent');
  };

  const navigateToRestaurantSelection = () => {
    navigation.navigate('RestaurantSelection' as never);
  };

  const renderPhoneStep = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.content}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#0d6efd" />
          <Text style={styles.welcomeTitle}>NileLink POS</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to manage your restaurant</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Phone Number</Text>
          
          <View style={styles.phoneInputContainer}>
            <Pressable
              style={styles.countryCodeButton}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <Ionicons name="chevron-down-outline" size={20} color="#6c757d" />
            </Pressable>
            
            <TextInput
              style={styles.phoneInput}
              placeholder="123 456 7890"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <Pressable
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handlePhoneSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our</Text>
          <View style={styles.footerLinks}>
            <Pressable>
              <Text style={styles.linkText}>Terms of Service</Text>
            </Pressable>
            <Text style={styles.footerText}> and </Text>
            <Pressable>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.pickerContainer}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Country Code</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </Pressable>
            </View>
            <ScrollView>
              {COUNTRY_CODES.map((country) => (
                <Pressable
                  key={country.code}
                  style={styles.countryOption}
                  onPress={() => {
                    setCountryCode(country.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.country.split(' ')[0]}</Text>
                  <Text style={styles.countryName}>{country.country}</Text>
                  <Text style={styles.countryCode}>{country.code}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );

  const renderVerificationStep = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.content}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#0d6efd" />
          <Text style={styles.welcomeTitle}>Enter Code</Text>
          <Text style={styles.welcomeSubtitle}>
            We sent a 6-digit code to{'\n'}
            {countryCode} {phoneNumber}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <Pressable
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleVerificationSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {canResend ? (
              <Pressable onPress={handleResendCode}>
                <Text style={styles.resendLink}>Resend</Text>
              </Pressable>
            ) : (
              <Text style={styles.resendTimer}>Resend in {timer}s</Text>
            )}
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => setStep('phone')}
          >
            <Text style={styles.secondaryButtonText}>Change Phone Number</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderBiometricSetup = () => (
    <View style={styles.content}>
      <View style={styles.welcomeContainer}>
        <Ionicons name="finger-print-outline" size={80} color="#0d6efd" />
        <Text style={styles.welcomeTitle}>Enable Biometric Login</Text>
        <Text style={styles.welcomeSubtitle}>
          Use Face ID or Touch ID for faster, more secure access
        </Text>
      </View>

      <View style={styles.biometricAnimation}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.skipText}>Setting up your secure access...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {step === 'phone' && renderPhoneStep()}
      {step === 'verification' && renderVerificationStep()}
      {step === 'biometric' && renderBiometricSetup()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: 40
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginTop: 16,
    marginBottom: 8
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    paddingHorizontal: 12,
    marginRight: 12
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginRight: 4
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da'
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0d6efd',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d6efd'
  },
  codeInput: {
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 24
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  resendText: {
    fontSize: 14,
    color: '#6c757d'
  },
  resendLink: {
    fontSize: 14,
    color: '#0d6efd',
    fontWeight: '600'
  },
  resendTimer: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24
  },
  footerText: {
    fontSize: 13,
    color: '#6c757d'
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 4
  },
  linkText: {
    fontSize: 13,
    color: '#0d6efd'
  },
  biometricAnimation: {
    alignItems: 'center',
    marginVertical: 40
  },
  skipText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center'
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529'
  },
  countryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4'
  },
  countryFlag: {
    fontSize: 18,
    width: 30
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    marginLeft: 12
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529'
  }
});