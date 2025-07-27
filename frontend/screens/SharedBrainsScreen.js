import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';

export default function SharedBrainsScreen({ navigation }) {
  const { user, apiCall, language } = useAuth();
  const { colors, getText } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  
  // Premium kontrolü
  const isPremium = user?.is_premium || false;

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false))
    });
    setAlertVisible(true);
  };

  // Premium olmayan kullanıcılar için "Çok Yakında" ekranı
  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.comingSoonContainer}>
          {/* Icon */}
          <Text style={styles.comingSoonIcon}>🧠</Text>
          
          {/* Title */}
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
            {language === 'en' ? 'Shared Brains' : 'Ortak Akıl'}
          </Text>
          
          {/* Subtitle */}
          <Text style={[styles.comingSoonSubtitle, { color: colors.textSecondary }]}>
            {language === 'en' 
              ? 'Coming Very Soon!' 
              : 'Çok Yakında!'}
          </Text>
          
          {/* Description */}
          <Text style={[styles.comingSoonDescription, { color: colors.textSecondary }]}>
            {language === 'en' 
              ? 'Share your notes with friends and collaborate on learning. This premium feature will be available soon!'
              : 'Notlarınızı arkadaşlarınızla paylaşın ve birlikte öğrenin. Bu premium özellik çok yakında kullanıma sunulacak!'}
          </Text>
          
          {/* Premium Badge */}
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>
              {language === 'en' ? '✨ Premium Feature' : '✨ Premium Özellik'}
            </Text>
          </View>
          
          {/* Upgrade Button */}
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => {
              const title = language === 'en' ? 'Advanced Package' : 'Advanced Paket';
              const message = language === 'en' 
                ? 'Advanced Package Features:\n\n• High storage capacity\n• Shared Brains\n• Ad-free experience'
                : 'Advanced Paket Özellikleri:\n\n• Yüksek depolama alanı\n• Ortak akıl (Shared Brains)\n• Reklamsız deneyim';
              showAlert(title, message, 'info');
            }}
          >
            <Text style={styles.upgradeButtonText}>
              {language === 'en' ? 'Upgrade to Premium' : 'Premium\'a Yükselt'}
            </Text>
          </TouchableOpacity>
          
          {/* Features List */}
          <View style={styles.featuresList}>
            <Text style={[styles.featuresTitle, { color: colors.text }]}>
              {language === 'en' ? 'What you\'ll get:' : 'Neler kazanacaksınız:'}
            </Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📤</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'en' 
                  ? 'Share notes with friends'
                  : 'Arkadaşlarınızla not paylaşın'}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📥</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'en' 
                  ? 'Receive shared notes'
                  : 'Paylaşılan notları alın'}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤝</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'en' 
                  ? 'Collaborate on learning'
                  : 'Birlikte öğrenin'}
              </Text>
            </View>
          </View>
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

  // Premium kullanıcılar için mevcut kod (şu anda boş bırakıyoruz)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.comingSoonContainer}>
        <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
          {language === 'en' ? 'Shared Brains (Premium)' : 'Ortak Akıl (Premium)'}
        </Text>
        <Text style={[styles.comingSoonDescription, { color: colors.textSecondary }]}>
          {language === 'en' 
            ? 'Premium features are being developed...'
            : 'Premium özellikler geliştiriliyor...'}
            </Text>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  comingSoonContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    paddingHorizontal: 32,
      paddingVertical: 48,
    },
  comingSoonIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 32,
      fontWeight: 'bold',
    textAlign: 'center',
      marginBottom: 12,
    },
  comingSoonSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  comingSoonDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 400,
  },
  premiumBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
      paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    },
  premiumBadgeText: {
    color: '#92400e',
      fontSize: 14,
      fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  upgradeButtonText: {
    color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  featuresList: {
    alignItems: 'flex-start',
    maxWidth: 300,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
    marginBottom: 12,
    },
    featureIcon: {
    fontSize: 20,
    marginRight: 12,
    },
    featureText: {
      fontSize: 16,
      flex: 1,
    },
}); 