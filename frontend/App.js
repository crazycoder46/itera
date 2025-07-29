import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';

import CustomAlert from './components/CustomAlert';
import { trackPageView, trackUserAction } from './utils/analytics';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import CalendarScreen from './screens/CalendarScreen';
import SharedBrainsScreen from './screens/SharedBrainsScreen';
import BoxDetailScreen from './screens/BoxDetailScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import EditNoteScreen from './screens/EditNoteScreen';
import ReviewScreen from './screens/ReviewScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import FAQScreen from './screens/FAQScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import PremiumManagementScreen from './screens/PremiumManagementScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icons
const HomeIcon = ({ color }) => (
  <Text style={{ fontSize: 20, color }}>🏠</Text>
);

const CalendarIcon = ({ color }) => (
  <Text style={{ fontSize: 20, color }}>📅</Text>
);

const BrainIcon = ({ color }) => (
  <Text style={{ fontSize: 20, color }}>🧠</Text>
);

const ProfileIcon = ({ color }) => (
  <Text style={{ fontSize: 20, color }}>👤</Text>
);

// Placeholder for SharedBrains
const SharedBrainsPlaceholder = () => {
  const { colors, getText } = useTheme();
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Text style={{ color: colors.text, fontSize: 18 }}>
        🧠 {getText('sharedBrains')}
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
        {getText('language') === 'en' ? 'Coming Soon' : 'Yakında Gelecek'}
      </Text>
    </View>
  );
};

// Header component with language switcher and advance button
function AppHeader() {
  const { language, updateLanguage, isPremium } = useAuth();
  const { colors, getText } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const toggleLanguage = async () => {
    const newLanguage = language === 'tr' ? 'en' : 'tr';
    await updateLanguage(newLanguage);
  };

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false))
    });
    setAlertVisible(true);
  };

  const handleAdvance = () => {
    const title = language === 'en' ? 'Advanced Package' : 'Advanced Paket';
    const message = language === 'en' 
      ? 'Advanced Package Features:\n\n• High storage capacity\n• Shared Brains\n• Ad-free experience'
      : 'Advanced Paket Özellikleri:\n\n• Yüksek depolama alanı\n• Ortak akıl (Shared Brains)\n• Reklamsız deneyim';
    showAlert(title, message, 'info');
  };

  return (
    <View style={{
      backgroundColor: 'transparent',
      paddingTop: 48,
      paddingBottom: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
        Itera
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity
          onPress={toggleLanguage}
          style={{
            backgroundColor: colors.card,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '500', fontSize: 12 }}>
            {language === 'tr' ? 'EN' : 'TR'}
          </Text>
        </TouchableOpacity>
        {isPremium() ? (
          <View
            style={{
              backgroundColor: '#10b981',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#000'
            }}
          >
            <Text style={{ color: '#000', fontWeight: '500', fontSize: 12 }}>
              ⭐ {getText('language') === 'en' ? 'Advanced' : 'Advanced'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleAdvance}
            style={{
              backgroundColor: '#f59e0b',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#000'
            }}
          >
            <Text style={{ color: '#000', fontWeight: '500', fontSize: 12 }}>
              🚀 {getText('upgrade')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
      />
    </View>
  );
}

// Tab Navigator for authenticated users
function MainTabs() {
  const { colors, getText } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <View style={{ flex: 1, paddingTop: 80 }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              height: 80,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginTop: -2,
              paddingBottom: 6,
            },
            tabBarItemStyle: {
              paddingVertical: 8,
            },
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              tabBarLabel: getText('home'),
              tabBarIcon: ({ color }) => (
                <HomeIcon color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Calendar" 
            component={CalendarScreen}
            options={{
              tabBarLabel: getText('calendar'),
              tabBarIcon: ({ color }) => (
                <CalendarIcon color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="SharedBrains" 
            component={SharedBrainsScreen}
            options={{
              tabBarLabel: getText('sharedBrains'),
              tabBarIcon: ({ color }) => (
                <BrainIcon color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              tabBarLabel: getText('profile'),
              tabBarIcon: ({ color }) => (
                <ProfileIcon color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
}

// Auth Stack for landing/login/register
function AuthStack() {
  const { language, updateLanguage } = useAuth();
  const { colors } = useTheme();

  const toggleLanguage = async () => {
    const newLanguage = language === 'tr' ? 'en' : 'tr';
    await updateLanguage(newLanguage);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="Login">
        {(props) => (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{
              backgroundColor: 'transparent',
              paddingTop: 48,
              paddingBottom: 16,
              paddingHorizontal: 24,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                Itera
              </Text>
              <TouchableOpacity
                onPress={toggleLanguage}
                style={{
                  backgroundColor: colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '500', fontSize: 12 }}>
                  {language === 'tr' ? 'EN' : 'TR'}
                </Text>
              </TouchableOpacity>
            </View>
            <LoginScreen {...props} />
          </View>
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{
              backgroundColor: 'transparent',
              paddingTop: 48,
              paddingBottom: 16,
              paddingHorizontal: 24,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                Itera
              </Text>
              <TouchableOpacity
                onPress={toggleLanguage}
                style={{
                  backgroundColor: colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '500', fontSize: 12 }}>
                  {language === 'tr' ? 'EN' : 'TR'}
                </Text>
              </TouchableOpacity>
            </View>
            <RegisterScreen {...props} />
          </View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// App Stack for authenticated users
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="BoxDetail" component={BoxDetailScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="EditNote" component={EditNoteScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
      <Stack.Screen name="PremiumManagement" component={PremiumManagementScreen} />
    </Stack.Navigator>
  );
}

// Main App Component
function AppContent() {
  const { user, loading } = useAuth();

  // Track app initialization
  useEffect(() => {
    trackPageView('app_launch');
    trackUserAction('app_opened', 'App Lifecycle');
  }, []);

  // Track authentication state changes
  useEffect(() => {
    if (user) {
      trackPageView('authenticated_user');
      trackUserAction('user_logged_in', 'Authentication');
    } else {
      trackPageView('unauthenticated_user');
      trackUserAction('user_logged_out', 'Authentication');
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
