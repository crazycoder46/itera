import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const PaddleCheckout = ({ onSuccess, onCancel, language = 'tr' }) => {
  const [loading, setLoading] = useState(false);
  const { user, apiCall } = useAuth();

  const getText = (key) => {
    const texts = {
      tr: {
        upgradeTitle: 'Advanced Plan\'a Yükselt',
        upgradeDescription: 'Sınırsız not paylaşımı ve gelişmiş özellikler',
        monthlyPrice: 'Aylık 29.99₺',
        yearlyPrice: 'Yıllık 299.99₺ (2 ay bedava)',
        startTrial: 'Ücretsiz Deneme Başlat',
        cancel: 'İptal',
        loading: 'Yükleniyor...',
        error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        success: 'Ödeme başarılı! Advanced plan aktif.',
        webhookError: 'Webhook işlenirken hata oluştu.'
      },
      en: {
        upgradeTitle: 'Upgrade to Advanced Plan',
        upgradeDescription: 'Unlimited note sharing and advanced features',
        monthlyPrice: 'Monthly 29.99₺',
        yearlyPrice: 'Yearly 299.99₺ (2 months free)',
        startTrial: 'Start Free Trial',
        cancel: 'Cancel',
        loading: 'Loading...',
        error: 'An error occurred. Please try again.',
        success: 'Payment successful! Advanced plan activated.',
        webhookError: 'Error processing webhook.'
      }
    };
    return texts[language][key] || key;
  };

  const handleMonthlySubscription = async () => {
    setLoading(true);
    try {
      // Paddle checkout URL'ini oluştur
      const checkoutUrl = createPaddleCheckoutUrl('monthly');
      
      // Web'de Paddle checkout'u aç
      if (typeof window !== 'undefined') {
        window.open(checkoutUrl, '_blank');
      } else {
        // Mobil için deep link veya in-app browser
        Alert.alert('Ödeme', 'Ödeme sayfası açılacak');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Hata', getText('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleYearlySubscription = async () => {
    setLoading(true);
    try {
      // Paddle checkout URL'ini oluştur
      const checkoutUrl = createPaddleCheckoutUrl('yearly');
      
      // Web'de Paddle checkout'u aç
      if (typeof window !== 'undefined') {
        window.open(checkoutUrl, '_blank');
      } else {
        // Mobil için deep link veya in-app browser
        Alert.alert('Ödeme', 'Ödeme sayfası açılacak');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Hata', getText('error'));
    } finally {
      setLoading(false);
    }
  };

  const createPaddleCheckoutUrl = (plan) => {
    const baseUrl = 'https://checkout.paddle.com';
    const params = new URLSearchParams({
      product: plan === 'monthly' ? 'monthly_plan_id' : 'yearly_plan_id',
      email: user?.email || '',
      passthrough: JSON.stringify({
        user_id: user?.id,
        plan: plan
      }),
      success_url: 'https://itera-frontend-omega.vercel.app/payment-success',
      cancel_url: 'https://itera-frontend-omega.vercel.app/payment-cancel',
      terms_url: 'https://itera-frontend-omega.vercel.app/terms-of-service',
      privacy_url: 'https://itera-frontend-omega.vercel.app/privacy-policy'
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handleTestSubscription = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/api/payment/test-subscription', {
        method: 'POST',
        body: JSON.stringify({ status: 'active' })
      });

      if (response.success) {
        Alert.alert('Başarılı', getText('success'));
        onSuccess?.();
      } else {
        Alert.alert('Hata', response.message || getText('error'));
      }
    } catch (error) {
      console.error('Test subscription error:', error);
      Alert.alert('Hata', getText('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getText('upgradeTitle')}</Text>
      <Text style={styles.description}>{getText('upgradeDescription')}</Text>
      
      <View style={styles.plansContainer}>
        {/* Monthly Plan */}
        <TouchableOpacity 
          style={styles.planCard}
          onPress={handleMonthlySubscription}
          disabled={loading}
        >
          <Text style={styles.planTitle}>Aylık Plan</Text>
          <Text style={styles.planPrice}>{getText('monthlyPrice')}</Text>
          <Text style={styles.planFeature}>• Sınırsız not paylaşımı</Text>
          <Text style={styles.planFeature}>• Gelişmiş analitik</Text>
          <Text style={styles.planFeature}>• Öncelikli destek</Text>
        </TouchableOpacity>

        {/* Yearly Plan */}
        <TouchableOpacity 
          style={styles.planCard}
          onPress={handleYearlySubscription}
          disabled={loading}
        >
          <Text style={styles.planTitle}>Yıllık Plan</Text>
          <Text style={styles.planPrice}>{getText('yearlyPrice')}</Text>
          <Text style={styles.planFeature}>• 2 ay bedava</Text>
          <Text style={styles.planFeature}>• Tüm aylık özellikler</Text>
          <Text style={styles.planFeature}>• %17 tasarruf</Text>
        </TouchableOpacity>
      </View>

      {/* Test Mode Button (sadece development) */}
      {process.env.NODE_ENV === 'development' && (
        <TouchableOpacity 
          style={styles.testButton}
          onPress={handleTestSubscription}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>🧪 Test Subscription</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>{getText('cancel')}</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{getText('loading')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  plansContainer: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  planFeature: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
};

export default PaddleCheckout; 