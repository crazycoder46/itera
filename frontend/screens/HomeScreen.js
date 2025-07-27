import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AddNoteModal from '../components/AddNoteModal';
import CustomAlert from '../components/CustomAlert';

export default function HomeScreen({ navigation }) {
  const { user, logout, testMode, apiCall } = useAuth();
  const { colors, getText } = useTheme();
  const [notes, setNotes] = useState([]);
  const [todayReviewCount, setTodayReviewCount] = useState(0);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [dailyReviewCompleted, setDailyReviewCompleted] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: null });

  // Leitner kutuları tanımı
  const leitnerBoxes = [
    { 
      id: 'daily', 
      name: getText('daily'), 
      color: '#3b82f6', 
      interval: 1,
      description: getText('dailyDescription')
    },
    { 
      id: 'every_2_days', 
      name: getText('every2Days'), 
      color: '#ef4444', 
      interval: 2,
      description: getText('every2DaysDescription')
    },
    { 
      id: 'every_4_days', 
      name: getText('every4Days'), 
      color: '#f97316', 
      interval: 4,
      description: getText('every4DaysDescription')
    },
    { 
      id: 'weekly', 
      name: getText('weekly'), 
      color: '#8b5cf6', 
      interval: 7,
      description: getText('weeklyDescription')
    },
    { 
      id: 'every_2_weeks', 
      name: getText('every2Weeks'), 
      color: '#10b981', 
      interval: 14,
      description: getText('every2WeeksDescription')
    },
    { 
      id: 'learned', 
      name: getText('learned'), 
      color: '#6b7280', 
      interval: 0,
      description: getText('learnedDescription')
    }
  ];

  useEffect(() => {
    loadNotes();
    checkDailyReviewStatus();
  }, []);

  // Sayfa odaklandığında notları yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
      checkDailyReviewStatus();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      console.log('Not yükleme başlatılıyor...');
      const response = await apiCall('/api/notes', {
        method: 'GET'
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        setNotes(response.notes || []);
        console.log('Notlar yüklendi:', response.notes?.length || 0);
        
        // Tekrar sayısını ayrı bir API çağrısı ile al
        loadTodayReviewCount();
      } else {
        console.error('Not yükleme hatası:', response.message);
        setNotes([]);
        setTodayReviewCount(0);
      }
    } catch (error) {
      console.error('API çağrısı hatası:', error);
      setNotes([]);
      setTodayReviewCount(0);
    }
  };

  const loadTodayReviewCount = async () => {
    try {
      const response = await apiCall('/api/notes/review', {
        method: 'GET'
      });
      
      if (response.success) {
        setTodayReviewCount((response.notes || []).length);
        console.log('Bugün tekrar edilecek not sayısı:', (response.notes || []).length);
      } else {
        setTodayReviewCount(0);
      }
    } catch (error) {
      console.error('Tekrar sayısı yüklenirken hata:', error);
      setTodayReviewCount(0);
    }
  };

  const checkDailyReviewStatus = async () => {
    try {
      const response = await apiCall('/api/notes/daily-review-status', {
        method: 'GET'
      });
      
      if (response.success) {
        setDailyReviewCompleted(response.isCompleted);
        console.log('Günlük tekrar durumu:', response.isCompleted);
      } else {
        setDailyReviewCompleted(false);
      }
    } catch (error) {
      console.error('Günlük tekrar durumu kontrol hatası:', error);
      setDailyReviewCompleted(false);
    }
  };

  const showAlert = (title, message, onConfirm = null) => {
    setAlertConfig({ title, message, onConfirm });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleLogout = () => {
    console.log('Çıkış butonuna tıklandı!');
    showAlert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      logout
    );
  };

  const handleBoxPress = (box) => {
    navigation.navigate('BoxDetail', { box });
  };

  const handleSaveNote = async (noteData) => {
    try {
      console.log('Not ekleniyor:', noteData);
      const response = await apiCall('/api/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });

      console.log('Not ekleme response:', response);

      if (response.success) {
        // Notları ve tekrar sayısını yeniden yükle
        loadNotes();
        const successMsg = getText('language') === 'en' ? 'Note added successfully!' : 'Not başarıyla eklendi!';
        showAlert(getText('language') === 'en' ? 'Success' : 'Başarılı', successMsg);
      } else {
        const errorMsg = getText('language') === 'en' ? 'Error adding note: ' : 'Not eklenirken hata oluştu: ';
        showAlert(getText('language') === 'en' ? 'Error' : 'Hata', errorMsg + response.message);
      }
    } catch (error) {
      console.error('Not ekleme hatası:', error);
      const errorMsg = getText('language') === 'en' ? 'Error adding note' : 'Not eklenirken hata oluştu';
      showAlert(getText('language') === 'en' ? 'Error' : 'Hata', errorMsg);
    }
  };

  const handleStartReview = () => {
    // Eğer günlük tekrar tamamlanmışsa, yeni notlar eklense bile tekrar başlatma
    if (dailyReviewCompleted) {
      const completedMsg = getText('language') === 'en' ? 'Great Job! You completed your review today.' : 'Harika İş! Bugün tekrarını tamamladın.';
      showAlert(getText('language') === 'en' ? 'Congratulations!' : 'Tebrikler!', completedMsg);
      return;
    }

    if (todayReviewCount > 0) {
      navigation.navigate('Review');
    } else {
      const noReviewMsg = getText('language') === 'en' ? 'Great Job! That\'s all for today.' : 'Harika İş! Bugünlük bu kadar.';
      showAlert(getText('language') === 'en' ? 'Congratulations!' : 'Tebrikler!', noReviewMsg);
    }
  };

  const getBoxNoteCount = (boxType) => {
    return notes.filter(note => note.box_type === boxType).length;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
                            {`${getText('welcome')}, ${user?.first_name}!`}
          </Text>
        </View>

        {/* Tekrar Başla Butonu */}
        <View style={styles.reviewSection}>
          <TouchableOpacity
            style={[
              styles.reviewButton,
              (todayReviewCount > 0 && !dailyReviewCompleted) ? styles.reviewButtonActive : styles.reviewButtonInactive
            ]}
            onPress={handleStartReview}
          >
            <Text style={styles.reviewButtonText}>
              {dailyReviewCompleted 
                ? `✅ ${getText('reviewComplete')}` 
                : todayReviewCount > 0 
                  ? `🚀 ${getText('reviewStart')} (${todayReviewCount} ${getText('language') === 'en' ? 'notes' : 'not'})` 
                  : `✅ ${getText('reviewComplete')}`
              }
            </Text>
            {(todayReviewCount > 0 && !dailyReviewCompleted) && (
              <Text style={styles.reviewButtonSubtext}>
                                  {getText('language') === 'en' 
                    ? `${todayReviewCount} ${todayReviewCount === 1 ? getText('note') : getText('notes')} are waiting for you today`
                    : `Bugün ${todayReviewCount} ${getText('todayNotesWaiting')}`
                  }
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Leitner Kutuları */}
        <View style={styles.boxesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {getText('leitnerBoxes')}
          </Text>
          
          <View style={styles.boxesContainer}>
            {leitnerBoxes.map((box) => (
              <TouchableOpacity
                key={box.id}
                style={[styles.box, { backgroundColor: box.color }]}
                onPress={() => handleBoxPress(box)}
                activeOpacity={0.8}
              >
                <Text style={styles.boxTitle}>{box.name}</Text>
                <Text style={styles.boxCount}>
                  {getBoxNoteCount(box.id)} {getText('language') === 'en' ? 'notes' : 'not'}
                </Text>
                <Text style={styles.boxInterval}>
                  {box.interval > 0 
                                            ? `${box.interval} ${box.interval === 1 ? getText('day') : getText('days')}`
                                          : getText('completed')
                  }
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test Modu Uyarısı */}
        {testMode && (
          <View style={styles.testModeWarning}>
            <Text style={styles.testModeText}>
              ⚠️ Test modu aktif - PostgreSQL bağlantısı kontrol edilsin
            </Text>
          </View>
        )}

        {/* Boşluk */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Add Note Modal */}
      <AddNoteModal
        visible={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        onSave={handleSaveNote}
        boxType={selectedBox?.id}
        boxName={selectedBox?.name}
      />
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          hideAlert();
          if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  reviewSection: {
    padding: 24,
  },
  reviewButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewButtonActive: {
    backgroundColor: '#059669',
  },
  reviewButtonInactive: {
    backgroundColor: '#6b7280',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reviewButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  boxesSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  boxesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  box: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boxTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  boxCount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  boxInterval: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  testModeWarning: {
    margin: 24,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  testModeText: {
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  spacer: {
    height: 50,
  },
}); 