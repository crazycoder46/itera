import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const AdminPanelScreen = ({ navigation }) => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminSecret: 'itera_admin_2024'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      } else {
        Alert.alert('Hata', 'İstatistikler alınamadı');
      }
    } catch (error) {
      console.error('Statistics fetch error:', error);
      Alert.alert('Hata', 'Bağlantı hatası');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  const StatCard = ({ title, value, icon, color = colors.primary }) => (
    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          🛠️ Admin Paneli
        </Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Landing')}
        >
          <Text style={[styles.logoutText, { color: colors.textSecondary }]}>
            Çıkış
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📊 Genel İstatistikler
          </Text>

          <View style={styles.statsGrid}>
            <StatCard
              title="Toplam Kullanıcı"
              value={statistics?.totalUsers || 0}
              icon="👥"
              color="#4CAF50"
            />
            <StatCard
              title="Toplam Not"
              value={statistics?.totalNotes || 0}
              icon="📝"
              color="#2196F3"
            />
            <StatCard
              title="Premium Kullanıcı"
              value={statistics?.premiumUsers || 0}
              icon="⭐"
              color="#FF9800"
            />
            <StatCard
              title="Toplam Resim"
              value={statistics?.totalImages || 0}
              icon="🖼️"
              color="#9C27B0"
            />
            <StatCard
              title="Son 7 Gün Kullanıcı"
              value={statistics?.recentUsers || 0}
              icon="🆕"
              color="#E91E63"
            />
            <StatCard
              title="Son 7 Gün Not"
              value={statistics?.recentNotes || 0}
              icon="📅"
              color="#607D8B"
            />
          </View>

          <View style={styles.actionsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🎛️ Yönetim İşlemleri
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('PremiumManagement')}
            >
              <Text style={styles.actionButtonText}>
                👑 Premium Yönetimi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={onRefresh}
            >
              <Text style={styles.actionButtonText}>
                🔄 İstatistikleri Yenile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminPanelScreen; 