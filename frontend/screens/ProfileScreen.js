import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, TextInput, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';
import PaddleCheckout from '../components/PaddleCheckout';

export default function ProfileScreen() {
  const { user, setUser, logout, testMode, updateProfile, uploadProfilePicture, deleteProfilePicture, language, updateLanguage, updateTheme, isPremium } = useAuth();
  const { colors, theme, getText } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editedUser, setEditedUser] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const languages = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' }
  ];

  const getThemes = () => [
    { code: 'light', name: getText('lightTheme') },
    { code: 'dark', name: getText('darkTheme') }
  ];

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false))
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    if (user) {
      setEditedUser({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!editedUser.first_name.trim() || !editedUser.last_name.trim()) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'First name and last name fields cannot be empty' 
        : 'Ad ve soyad alanları boş olamaz';
      showAlert(title, message, 'error');
      return;
    }

    try {
      const result = await updateProfile({
        first_name: editedUser.first_name.trim(),
        last_name: editedUser.last_name.trim()
      });

      if (result.success) {
        const title = language === 'en' ? 'Success' : 'Başarılı';
        const message = result.message || (language === 'en' 
          ? 'Profile updated successfully' 
          : 'Profil başarıyla güncellendi');
        showAlert(title, message, 'success');
        setIsEditing(false);
      } else {
        const title = language === 'en' ? 'Error' : 'Hata';
        const message = result.message || (language === 'en' 
          ? 'Error updating profile' 
          : 'Profil güncellenirken hata oluştu');
        showAlert(title, message, 'error');
      }
    } catch (error) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'Error updating profile' 
        : 'Profil güncellenirken hata oluştu';
      showAlert(title, message, 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword.trim() || !passwordData.confirmPassword.trim()) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'New password fields cannot be empty' 
        : 'Yeni şifre alanları boş olamaz';
      showAlert(title, message, 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'New passwords do not match' 
        : 'Yeni şifreler eşleşmiyor';
      showAlert(title, message, 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'Password must be at least 6 characters' 
        : 'Şifre en az 6 karakter olmalıdır';
      showAlert(title, message, 'error');
      return;
    }

    try {
      const result = await updateProfile({
        password: passwordData.newPassword
      });

      if (result.success) {
        const title = language === 'en' ? 'Success' : 'Başarılı';
        const message = language === 'en' 
          ? 'Password changed successfully' 
          : 'Şifre başarıyla değiştirildi';
        showAlert(title, message, 'success');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const title = language === 'en' ? 'Error' : 'Hata';
        const message = result.message || (language === 'en' 
          ? 'Error changing password' 
          : 'Şifre değiştirilirken hata oluştu');
        showAlert(title, message, 'error');
      }
    } catch (error) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'Error changing password' 
        : 'Şifre değiştirilirken hata oluştu';
      showAlert(title, message, 'error');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(getText('logoutConfirm'));
      if (confirmed) {
        logout();
      }
    } else {
      Alert.alert(
        getText('logoutTitle'),
        getText('logoutConfirm'),
        [
          { text: getText('cancelText'), style: 'cancel' },
          { text: getText('logoutTitle'), onPress: logout, style: 'destructive' }
        ]
      );
    }
  };

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    showAlert('Başarılı', 'Advanced plan başarıyla aktifleştirildi!', 'success');
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const handleLanguageSelect = async (languageCode) => {
    await updateLanguage(languageCode);
    setShowLanguageModal(false);
    
    // Dil değişikliği mesajı
    const title = languageCode === 'en' ? 'Information' : 'Bilgi';
    const message = languageCode === 'en' 
      ? 'Language changed to English!' 
      : 'Dil Türkçe olarak değiştirildi!';
    showAlert(title, message, 'success');
  };

  const handleThemeSelect = async (themeCode) => {
    await updateTheme(themeCode);
    setShowThemeModal(false);
    
    // Tema değişikliği mesajı
    const title = language === 'en' ? 'Theme' : 'Tema';
    const message = themeCode === 'dark' 
      ? (language === 'en' ? 'Dark theme activated!' : 'Koyu tema aktif edildi!')
      : (language === 'en' ? 'Light theme activated!' : 'Açık tema aktif edildi!');
    showAlert(title, message, 'success');
  };

  const handleProfilePictureChange = async () => {
    try {
      // Web için farklı yaklaşım
      if (typeof window !== 'undefined') {
        // Web implementation - doğrudan backend'e gönder
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event) => {
          const file = event.target.files[0];
          if (file) {
            const formData = new FormData();
            formData.append('profilePicture', file);

            try {
              const token = localStorage.getItem('token');
              const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
              const response = await fetch(`${apiUrl}/api/auth/profile/picture`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                body: formData
              });

              const data = await response.json();

              if (response.ok) {
                // AuthContext user state'ini güncelle
                const updatedUser = { ...user, profile_picture: data.user.profile_picture };
                setUser(updatedUser);
                showAlert('Başarılı', data.message, 'success');
              } else {
                showAlert('Hata', data.message || 'Profil fotoğrafı yüklenirken hata oluştu', 'error');
              }
            } catch (error) {
              console.error('Upload error:', error);
              showAlert('Hata', 'Profil fotoğrafı yüklenirken hata oluştu', 'error');
            }
          }
        };
        input.click();
      } else {
        // Mobile implementation
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          const title = language === 'en' ? 'Permission Required' : 'İzin Gerekli';
          const message = language === 'en' 
            ? 'Gallery access permission is required to upload profile picture.'
            : 'Profil fotoğrafı yüklemek için galeri erişim izni gerekiyor.';
          Alert.alert(title, message);
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uploadResult = await uploadProfilePicture(result.assets[0].uri);
          if (uploadResult.success) {
            const title = language === 'en' ? 'Success' : 'Başarılı';
            Alert.alert(title, uploadResult.message);
          } else {
            const title = language === 'en' ? 'Error' : 'Hata';
            const message = uploadResult.message || (language === 'en' 
              ? 'Error uploading profile picture' 
              : 'Profil fotoğrafı yüklenirken hata oluştu');
            Alert.alert(title, message);
          }
        }
      }
    } catch (error) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'Error uploading profile picture' 
        : 'Profil fotoğrafı yüklenirken hata oluştu';
      showAlert(title, message, 'error');
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      const title = language === 'en' ? 'Delete Profile Picture' : 'Profil Fotoğrafını Sil';
      const confirmMessage = language === 'en' 
        ? 'Are you sure you want to delete your profile picture?' 
        : 'Profil fotoğrafınızı silmek istediğinizden emin misiniz?';
      
      showAlert(
        title,
        confirmMessage,
        'warning',
        async () => {
          setAlertVisible(false);
          const result = await deleteProfilePicture();
          const successTitle = language === 'en' ? 'Success' : 'Başarılı';
          const errorTitle = language === 'en' ? 'Error' : 'Hata';
          const message = result.message || (language === 'en' ? 'Profile picture deleted successfully' : 'Profil fotoğrafı başarıyla silindi');
          showAlert(result.success ? successTitle : errorTitle, message, result.success ? 'success' : 'error');
        }
      );
    } catch (error) {
      const title = language === 'en' ? 'Error' : 'Hata';
      const message = language === 'en' 
        ? 'Error deleting profile picture' 
        : 'Profil fotoğrafı silinirken hata oluştu';
      showAlert(title, message, 'error');
    }
  };

  const getCurrentLanguageName = () => {
    return languages.find(lang => lang.code === language)?.name || 'Türkçe';
  };

  const getCurrentThemeName = () => {
    return getThemes().find(t => t.code === theme)?.name || getText('lightTheme');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.title, { color: colors.text }]}>{getText('profile')}</Text>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profilePicture}>
            {user?.profile_picture ? (
              <Image 
                source={{ uri: user.profile_picture }}
                style={styles.profileImage}
                onError={() => {}}
              />
            ) : (
              <Text style={styles.profileInitials}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </Text>
            )}
          </View>
          <View style={styles.profileButtons}>
            <TouchableOpacity style={styles.changePictureButton} onPress={handleProfilePictureChange}>
              <Text style={styles.changePictureText}>
                {user?.profile_picture 
                  ? getText('changePhoto')
                                      : getText('addPhoto')
                }
              </Text>
            </TouchableOpacity>
            {user?.profile_picture && (
              <TouchableOpacity style={styles.deletePictureButton} onPress={handleDeleteProfilePicture}>
                <Text style={styles.deletePictureText}>
                  {getText('delete')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User Info Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{getText('userInfo')}</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? getText('cancel') : getText('edit')}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{getText('firstName')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editedUser.first_name}
                  onChangeText={(text) => setEditedUser(prev => ({...prev, first_name: text}))}
                  placeholder={getText('language') === 'en' ? 'Enter your first name' : 'Adınızı girin'}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{getText('lastName')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editedUser.last_name}
                  onChangeText={(text) => setEditedUser(prev => ({...prev, last_name: text}))}
                  placeholder={getText('language') === 'en' ? 'Enter your last name' : 'Soyadınızı girin'}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{getText('email')}</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput, { backgroundColor: colors.border, color: colors.textSecondary, borderColor: colors.border }]}
                  value={editedUser.email}
                  editable={false}
                  placeholder={getText('language') === 'en' ? 'Email cannot be changed' : 'E-posta değiştirilemez'}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>{getText('save')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.infoDisplay, { backgroundColor: colors.background }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>{getText('firstName')}:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user?.first_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>{getText('lastName')}:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user?.last_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>{getText('email')}:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Password Change Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{getText('changePassword')}</Text>
            <TouchableOpacity
              onPress={() => setIsChangingPassword(!isChangingPassword)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isChangingPassword ? getText('cancel') : getText('change')}
              </Text>
            </TouchableOpacity>
          </View>

          {isChangingPassword && (
            <View style={[styles.editForm, { backgroundColor: colors.background }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{getText('newPassword')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData(prev => ({...prev, newPassword: text}))}
                  placeholder={getText('language') === 'en' ? 'Enter new password' : 'Yeni şifrenizi girin'}
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{getText('confirmPassword')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData(prev => ({...prev, confirmPassword: text}))}
                  placeholder={getText('language') === 'en' ? 'Confirm new password' : 'Yeni şifrenizi tekrar girin'}
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>{getText('change')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{getText('settings')}</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>{getText('language')}</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{getCurrentLanguageName()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowThemeModal(true)}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>{getText('theme')}</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{getCurrentThemeName()}</Text>
          </TouchableOpacity>
        </View>

        {/* Plan Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{getText('plan')}</Text>
          
          <View style={[styles.planInfo, { backgroundColor: colors.background }]}>
            <Text style={[styles.planName, { color: colors.text }]}>
              {isPremium() ? getText('advancedUser') : getText('basicPlan')}
            </Text>
            <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
              {isPremium() 
                ? getText('advancedPlan')
                                  : getText('basicPlanDescription')
              }
            </Text>
          </View>

          {!isPremium() && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>
                🚀 {language === 'en' ? 'Upgrade to Advanced' : 'Advanced\'e Yükselt'}
              </Text>
            </TouchableOpacity>
          )}

          {isPremium() && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.premiumBadgeText}>
                ⭐ {getText('advancedUser')}
              </Text>
            </View>
          )}
        </View>

        {/* Test Mode Warning */}
        {testMode && (
          <View style={styles.testModeWarning}>
            <Text style={styles.testModeText}>
              ⚠️ {getText('language') === 'en' ? 'Test mode active - Check PostgreSQL connection' : 'Test modu aktif - PostgreSQL bağlantısı kontrol edilsin'}
            </Text>
          </View>
        )}

        {/* Logout Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>{getText('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getText('language')}
            </Text>
            
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalOption,
                  language === lang.code && styles.modalOptionSelected
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: colors.text },
                  language === lang.code && styles.modalOptionTextSelected
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {getText('close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getText('theme')}
            </Text>
            
            {getThemes().map((thm) => (
              <TouchableOpacity
                key={thm.code}
                style={[
                  styles.modalOption,
                  theme === thm.code && styles.modalOptionSelected
                ]}
                onPress={() => handleThemeSelect(thm.code)}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: colors.text },
                  theme === thm.code && styles.modalOptionTextSelected
                ]}>
                  {thm.name}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {getText('close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handlePaymentCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <PaddleCheckout
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              language={language}
            />
          </View>
        </View>
      </Modal>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertVisible(false)}
        confirmText={getText('ok')}
        cancelText={getText('cancel')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'transparent',
    paddingTop: 90,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInitials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  changePictureButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
  },
  changePictureText: {
    color: '#2563eb',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  infoDisplay: {
    padding: 16,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  editForm: {
    padding: 16,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  settingValue: {
    fontSize: 16,
    color: '#6b7280',
  },
  planInfo: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  planDescription: {
    fontSize: 14,
    color: '#0284c7',
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testModeWarning: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 24,
  },
  testModeText: {
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalOptionTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  profileButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletePictureButton: {
    padding: 8,
  },
  deletePictureText: {
    color: '#dc2626',
    fontSize: 14,
  },
}); 