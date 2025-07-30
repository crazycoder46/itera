import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SimpleCaptcha from '../components/SimpleCaptcha';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { register, language, updateLanguage } = useAuth();
  const { colors } = useTheme();

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'tr' : 'en';
    await updateLanguage(newLanguage);
  };

  // Form validation - button should be enabled only when all conditions are met
  const isFormValid = () => {
    const valid = firstName.trim() !== '' &&
                  lastName.trim() !== '' &&
                  email.trim() !== '' &&
                  password.length >= 6 &&
                  confirmPassword === password &&
                  privacyAccepted &&
                  termsAccepted &&
                  captchaVerified;
    return valid;
  };

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Form validation state:', {
      firstName: firstName.trim() !== '',
      lastName: lastName.trim() !== '',
      email: email.trim() !== '',
      password: password.length >= 6,
      confirmPassword: confirmPassword === password,
      privacyAccepted,
      termsAccepted,
      captchaVerified,
      isValid: isFormValid()
    });
  }, [firstName, lastName, email, password, confirmPassword, privacyAccepted, termsAccepted, captchaVerified]);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      const errorMsg = language === 'en' ? 'Please fill all fields' : 'Lütfen tüm alanları doldurun';
      Alert.alert(language === 'en' ? 'Error' : 'Hata', errorMsg);
      return;
    }

    if (!privacyAccepted || !termsAccepted) {
      const errorMsg = language === 'en' 
        ? 'Please accept Privacy Policy and Terms of Service' 
        : 'Lütfen Gizlilik Politikası ve Kullanım Şartlarını kabul edin';
      Alert.alert(language === 'en' ? 'Error' : 'Hata', errorMsg);
      return;
    }

    if (!captchaVerified) {
      const errorMsg = language === 'en' 
        ? 'Please complete the security verification' 
        : 'Lütfen güvenlik doğrulamasını tamamlayın';
      Alert.alert(language === 'en' ? 'Error' : 'Hata', errorMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = language === 'en' ? 'Passwords do not match' : 'Şifreler eşleşmiyor';
      Alert.alert(language === 'en' ? 'Error' : 'Hata', errorMsg);
      return;
    }

    if (password.length < 6) {
      const errorMsg = language === 'en' ? 'Password must be at least 6 characters' : 'Şifre en az 6 karakter olmalıdır';
      Alert.alert(language === 'en' ? 'Error' : 'Hata', errorMsg);
      return;
    }

    setLoading(true);
    
    // Kullanıcının timezone offset'ini al (dakika cinsinden)
    const timezoneOffset = new Date().getTimezoneOffset() * -1; // Negatif çünkü getTimezoneOffset UTC'den farkı verir
    
    const result = await register(firstName, lastName, email, password, timezoneOffset);
    setLoading(false);

    if (result.success) {
      // Web'de alert, mobilde Alert
      const successMsg = language === 'en' 
        ? 'Registration successful! Redirecting to login...' 
        : 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
      
      if (typeof window !== 'undefined') {
        window.alert(successMsg);
        // Web'de alert sonrası yönlendirme
        setTimeout(() => {
          navigation.navigate('Login');
        }, 500);
      } else {
        Alert.alert(
          language === 'en' ? 'Success' : 'Başarılı', 
          successMsg,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } else {
      const errorMsg = result.message || (language === 'en' ? 'Registration failed' : 'Kayıt başarısız');
      Alert.alert(language === 'en' ? 'Error' : 'Hata', errorMsg);
    }
  };

  // Calculate form validity for button styling
  const formIsValid = isFormValid();

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {language === 'en' ? 'Create Account' : 'Hesap Oluştur'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {language === 'en' 
                ? 'Join Itera and start your learning journey'
                : 'Itera\'ya katılın ve öğrenme yolculuğunuza başlayın'
              }
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {language === 'en' ? 'First Name' : 'Ad'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder={language === 'en' ? 'Enter your first name' : 'Adınızı girin'}
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {language === 'en' ? 'Last Name' : 'Soyad'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder={language === 'en' ? 'Enter your last name' : 'Soyadınızı girin'}
                placeholderTextColor={colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {language === 'en' ? 'Email' : 'E-posta'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder={language === 'en' ? 'Enter your email' : 'E-posta adresinizi girin'}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {language === 'en' ? 'Password' : 'Şifre'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder={language === 'en' ? 'Enter password (at least 6 characters)' : 'Şifrenizi girin (en az 6 karakter)'}
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {language === 'en' ? 'Confirm Password' : 'Şifre Tekrar'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder={language === 'en' ? 'Confirm your password' : 'Şifrenizi tekrar girin'}
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* CAPTCHA Component */}
            <SimpleCaptcha 
              onVerify={setCaptchaVerified}
              language={language}
            />

            {/* Privacy Policy Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, { borderColor: colors.border }]}
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
              >
                {privacyAccepted && (
                  <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
              <View style={styles.checkboxTextContainer}>
                <Text style={[styles.checkboxText, { color: colors.text }]}>
                  {language === 'en' ? 'I have read and accept the ' : 'Okudum ve kabul ediyorum: '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                  <Text style={[styles.linkInText, { color: colors.primary }]}>
                    {language === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms of Service Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, { borderColor: colors.border }]}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                {termsAccepted && (
                  <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
              <View style={styles.checkboxTextContainer}>
                <Text style={[styles.checkboxText, { color: colors.text }]}>
                  {language === 'en' ? 'I have read and accept the ' : 'Okudum ve kabul ediyorum: '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
                  <Text style={[styles.linkInText, { color: colors.primary }]}>
                    {language === 'en' ? 'Terms of Service' : 'Kullanım Şartları'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>



            <TouchableOpacity
              style={[
                styles.button, 
                { 
                  backgroundColor: formIsValid ? colors.primary : '#9ca3af',
                  opacity: formIsValid ? 1 : 0.6
                }, 
                loading && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={loading || !formIsValid}
            >
              <Text style={styles.buttonText}>
                {loading 
                  ? (language === 'en' ? 'Creating account...' : 'Kayıt oluşturuluyor...')
                  : (language === 'en' ? 'Sign Up' : 'Kayıt Ol')
                }
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                {language === 'en' 
                  ? 'Already have an account? Sign in'
                  : 'Zaten hesabınız var mı? Giriş yapın'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    paddingTop: 128,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  footer: {
    marginTop: 24,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 3,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkInText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  debugContainer: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
}); 