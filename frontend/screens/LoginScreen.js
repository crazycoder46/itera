import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, language, updateLanguage } = useAuth();
  const { getText, colors } = useTheme();

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'tr' : 'en';
    await updateLanguage(newLanguage);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      const errorMsg = language === 'en' ? 'Please fill all fields' : 'Lütfen tüm alanları doldurun';
      Alert.alert(language === 'en' ? 'Error' : 'Hata', errorMsg);
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      const errorTitle = language === 'en' ? 'Login Error' : 'Giriş Hatası';
      const errorMsg = language === 'en' ? 'Login failed' : 'Giriş yapılamadı';
      Alert.alert(errorTitle, result.message || errorMsg);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Itera</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {language === 'en' ? 'Welcome! Please sign in' : 'Hoş geldiniz! Giriş yapın'}
          </Text>
        </View>

        <View style={styles.form}>
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
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {language === 'en' ? 'Password' : 'Şifre'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder={language === 'en' ? 'Enter your password' : 'Şifrenizi girin'}
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading 
                ? (language === 'en' ? 'Signing in...' : 'Giriş yapılıyor...')
                : (language === 'en' ? 'Sign In' : 'Giriş Yap')
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              {language === 'en' 
                ? "Don't have an account? Sign up"
                : 'Hesabınız yok mu? Kayıt olun'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
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
}); 