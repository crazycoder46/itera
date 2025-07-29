import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PremiumManagementScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const { colors } = useTheme();

  const checkUserStatus = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Email adresi gerekli');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/user-status/${encodeURIComponent(email)}?adminSecret=itera_admin_2024`
      );

      const data = await response.json();

      if (data.success) {
        setUserStatus(data.user);
      } else {
        Alert.alert('Hata', data.message || 'Kullanıcı bulunamadı');
        setUserStatus(null);
      }
    } catch (error) {
      console.error('User status check error:', error);
      Alert.alert('Hata', 'Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePremiumStatus = async (isPremium) => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Email adresi gerekli');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/set-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          isPremium,
          adminSecret: 'itera_admin_2024'
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Başarılı', 
          `${email} kullanıcısının premium durumu ${isPremium ? 'aktif' : 'pasif'} yapıldı`,
          [
            {
              text: 'Tamam',
              onPress: () => {
                setUserStatus(data.user);
                setEmail('');
              }
            }
          ]
        );
      } else {
        Alert.alert('Hata', data.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Premium update error:', error);
      Alert.alert('Hata', 'Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Yok';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
            ← Geri
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          👑 Premium Yönetimi
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Kullanıcı Arama
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Kullanıcı email adresi"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={checkUserStatus}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Aranıyor...' : 'Kullanıcı Ara'}
            </Text>
          </TouchableOpacity>

          {userStatus && (
            <View style={[styles.userCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.userCardTitle, { color: colors.text }]}>
                👤 Kullanıcı Bilgileri
              </Text>
              
              <View style={styles.userInfo}>
                <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                  Email:
                </Text>
                <Text style={[styles.userInfoValue, { color: colors.text }]}>
                  {userStatus.email}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                  Premium Durumu:
                </Text>
                <Text style={[
                  styles.userInfoValue, 
                  { color: userStatus.is_premium ? '#4CAF50' : '#F44336' }
                ]}>
                  {userStatus.is_premium ? '⭐ Aktif' : '❌ Pasif'}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                  Premium Durumu:
                </Text>
                <Text style={[
                  styles.userInfoValue, 
                  { color: userStatus.is_premium ? '#4CAF50' : '#F44336' }
                ]}>
                  {userStatus.is_premium ? '⭐ Aktif' : '❌ Pasif'}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                  Kayıt Tarihi:
                </Text>
                <Text style={[styles.userInfoValue, { color: colors.text }]}>
                  {formatDate(userStatus.created_at)}
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => updatePremiumStatus(true)}
                  disabled={isLoading || userStatus.is_premium}
                >
                  <Text style={styles.buttonText}>
                    Premium Yap
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={() => updatePremiumStatus(false)}
                  disabled={isLoading || !userStatus.is_premium}
                >
                  <Text style={styles.buttonText}>
                    Premium İptal Et
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  userCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default PremiumManagementScreen; 