import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('tr');
  const [theme, setTheme] = useState('light');

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  const TEST_MODE = false; // PostgreSQL ile live çalışıyoruz

  // Load token from storage on app start
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      const storedLanguage = await AsyncStorage.getItem('language');
      const storedTheme = await AsyncStorage.getItem('theme');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      
      if (storedLanguage) {
        setLanguage(storedLanguage);
      } else {
        // İlk kez açılıyorsa cihaz dilini tespit et
        const deviceLanguage = navigator.language || navigator.userLanguage || 'tr';
        const detectedLanguage = deviceLanguage.startsWith('tr') ? 'tr' : 'en';
        setLanguage(detectedLanguage);
        await AsyncStorage.setItem('language', detectedLanguage);
      }
      
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (TEST_MODE) {
      // Test mode - simulated login
      if (email && password) {
        // Kayıtlı test user bilgilerini kontrol et
        const savedTestUser = await AsyncStorage.getItem('test_user_data');
        let testUser;
        
        if (savedTestUser) {
          const userData = JSON.parse(savedTestUser);
          // Email ve şifre eşleşiyor mu kontrol et
          if (userData.email === email && userData.password === password) {
            testUser = {
              id: 1,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email
            };
          } else {
            return { success: false, message: 'Email veya şifre hatalı' };
          }
        } else {
          // Kayıtlı kullanıcı yok, varsayılan test user
          testUser = {
            id: 1,
            first_name: 'Test',
            last_name: 'User',
            email: email
          };
        }
        
        const testToken = 'test-token-' + Date.now();
        
        await AsyncStorage.setItem('token', testToken);
        await AsyncStorage.setItem('user', JSON.stringify(testUser));
        setToken(testToken);
        setUser(testUser);
        return { success: true };
      } else {
        return { success: false, message: 'Email ve şifre gerekli' };
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Bağlantı hatası' };
    }
  };

  const register = async (firstName, lastName, email, password, timezoneOffset) => {
    if (TEST_MODE) {
      // Test mode - simulated register (kayıt işlemi sadece, otomatik giriş yok)
      if (firstName && lastName && email && password) {
        // Test modunda kayıt bilgilerini sakla
        const testUserData = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          timezone_offset: timezoneOffset
        };
        await AsyncStorage.setItem('test_user_data', JSON.stringify(testUserData));
        
        return { success: true, message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' };
      } else {
        return { success: false, message: 'Tüm alanlar gerekli' };
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, timezoneOffset }),
      });

      const data = await response.json();

      if (response.ok) {
        // Kayıt başarılı, otomatik giriş yapma
        return { success: true, message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Bağlantı hatası' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Dil ve tema ayarlarını koruyoruz
      setToken(null);
      setUser(null);
    } catch (error) {
      // Silent error handling
    }
  };

  const updateLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Language update error:', error);
    }
  };

  const updateTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Theme update error:', error);
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    if (TEST_MODE) {
      // Test mode - mock responses
      if (endpoint === '/api/notes' && options.method === 'GET') {
        return {
          success: true,
          notes: [
            { id: 1, title: 'JavaScript Temelleri', content: '# JavaScript Temelleri\n\nDeğişkenler, fonksiyonlar...', box_type: 'daily', created_at: new Date().toISOString() },
            { id: 2, title: 'React Hooks', content: '# React Hooks\n\nuseState, useEffect...', box_type: 'every_2_days', created_at: new Date().toISOString() },
            { id: 3, title: 'PostgreSQL', content: '# PostgreSQL\n\nVeritabanı sorguları...', box_type: 'weekly', created_at: new Date().toISOString() }
          ]
        };
      }
      if (endpoint === '/api/notes' && options.method === 'POST') {
        return {
          success: true,
          message: 'Not başarıyla eklendi (test mode)',
          note: { id: Date.now(), ...JSON.parse(options.body), created_at: new Date().toISOString() }
        };
      }
      return { success: false, message: 'Test mode - endpoint not implemented' };
    }

    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      
      // Headers'ı ayarla
      const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };
      
      // FormData değilse Content-Type ekle
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Bağlantı hatası: ' + error.message };
    }
  };

  const updateProfile = async (profileData) => {
    if (TEST_MODE) {
      // Test mode - simulated profile update
      const updatedUser = { ...user, ...profileData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, message: 'Profil güncellendi (test mode)' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Bağlantı hatası' };
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    if (TEST_MODE) {
      // Test mode - simulated profile picture upload
      const updatedUser = { ...user, profile_picture: imageUri };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, message: 'Profil fotoğrafı yüklendi (test mode)' };
    }

    try {
      // Sadece mobil için kullanılacak - web ProfileScreen'de doğrudan handle ediyor
      if (typeof window !== 'undefined') {
        return { success: false, message: 'Web için ProfileScreen\'de handle ediliyor' };
      }

      // Mobile implementation
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      return { success: false, message: 'Profil fotoğrafı yüklenirken hata oluştu' };
    }
  };

  const deleteProfilePicture = async () => {
    if (TEST_MODE) {
      // Test mode - simulated profile picture deletion
      const updatedUser = { ...user, profile_picture: null };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, message: 'Profil fotoğrafı silindi (test mode)' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile picture delete error:', error);
      return { success: false, message: 'Profil fotoğrafı silinirken hata oluştu' };
    }
  };

  const getProfile = async () => {
    if (TEST_MODE) {
      return { success: true, user };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, message: 'Bağlantı hatası' };
    }
  };

  // Premium kontrolü
  const isPremium = () => {
    return user?.is_premium === true;
  };

  // User state'ini manuel güncelleme fonksiyonu (web için)
  const refreshUser = async () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('User refresh error:', error);
    }
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    language,
    theme,
    login,
    register,
    logout,
    apiCall,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    getProfile,
    refreshUser,
    updateLanguage,
    updateTheme,
    isAuthenticated: !!token,
    testMode: TEST_MODE,
    isPremium,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 