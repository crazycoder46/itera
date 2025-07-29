import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';

export default function SharedBrainsScreen({ navigation }) {
  const { user, apiCall, language } = useAuth();
  const { colors, getText } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', 'share'
  const [shareCode, setShareCode] = useState('');
  const [myShareCode, setMyShareCode] = useState('');
  const [myNotes, setMyNotes] = useState([]);
  const [receivedNotes, setReceivedNotes] = useState([]);
  const [sentNotes, setSentNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

  // Premium kullanıcılar için Shared Brains sayfası
  useEffect(() => {
    if (isPremium) {
      loadData();
    }
  }, [isPremium]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Kendi share code'unu al
      const codeResponse = await apiCall('GET', '/api/shared/my-code');
      if (codeResponse.success) {
        setMyShareCode(codeResponse.shareCode);
      }

      // Kendi notlarını al
      const notesResponse = await apiCall('GET', '/api/shared/my-notes');
      if (notesResponse.success) {
        setMyNotes(notesResponse.notes);
      }

      // Gelen notları al
      const receivedResponse = await apiCall('GET', '/api/shared/received');
      if (receivedResponse.success) {
        setReceivedNotes(receivedResponse.notes);
      }

      // Gönderilen notları al
      const sentResponse = await apiCall('GET', '/api/shared/sent');
      if (sentResponse.success) {
        setSentNotes(sentResponse.notes);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareNote = async () => {
    if (!selectedNote || !shareCode.trim()) {
      showAlert(
        language === 'en' ? 'Error' : 'Hata',
        language === 'en' ? 'Please select a note and enter a share code' : 'Lütfen bir not seçin ve paylaşım kodu girin',
        'error'
      );
      return;
    }

    try {
      const response = await apiCall('POST', '/api/shared/share-note', {
        noteId: selectedNote.id,
        shareCode: shareCode.trim()
      });

      if (response.success) {
        showAlert(
          language === 'en' ? 'Success' : 'Başarılı',
          language === 'en' ? 'Note shared successfully!' : 'Not başarıyla paylaşıldı!',
          'success',
          () => {
            setShareModalVisible(false);
            setSelectedNote(null);
            setShareCode('');
            loadData();
          }
        );
      }
    } catch (error) {
      showAlert(
        language === 'en' ? 'Error' : 'Hata',
        error.message || (language === 'en' ? 'Failed to share note' : 'Not paylaşılamadı'),
        'error'
      );
    }
  };

  const handleAcceptNote = async (noteId) => {
    try {
      const response = await apiCall('POST', `/api/shared/accept-note/${noteId}`);
      if (response.success) {
        showAlert(
          language === 'en' ? 'Success' : 'Başarılı',
          language === 'en' ? 'Note added to your notes!' : 'Not notlarınıza eklendi!',
          'success',
          loadData
        );
      }
    } catch (error) {
      showAlert(
        language === 'en' ? 'Error' : 'Hata',
        error.message || (language === 'en' ? 'Failed to accept note' : 'Not kabul edilemedi'),
        'error'
      );
    }
  };

  const handleDeleteNote = async (noteId, type) => {
    try {
      const endpoint = type === 'received' ? `/api/shared/received/${noteId}` : `/api/shared/sent/${noteId}`;
      const response = await apiCall('DELETE', endpoint);
      if (response.success) {
        showAlert(
          language === 'en' ? 'Success' : 'Başarılı',
          language === 'en' ? 'Note deleted!' : 'Not silindi!',
          'success',
          loadData
        );
      }
    } catch (error) {
      showAlert(
        language === 'en' ? 'Error' : 'Hata',
        error.message || (language === 'en' ? 'Failed to delete note' : 'Not silinemedi'),
        'error'
      );
    }
  };

  const renderNoteItem = ({ item, type }) => (
    <View style={[styles.noteItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
          {new Date(item.shared_at).toLocaleDateString()}
        </Text>
      </View>
      
      {type === 'received' && !item.is_accepted && (
        <View style={styles.noteActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => handleAcceptNote(item.id)}
          >
            <Text style={styles.actionButtonText}>
              {language === 'en' ? 'Add to Notes' : 'Notlara Ekle'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => handleDeleteNote(item.id, 'received')}
          >
            <Text style={styles.actionButtonText}>
              {language === 'en' ? 'Delete' : 'Sil'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {type === 'sent' && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleDeleteNote(item.id, 'sent')}
        >
          <Text style={styles.actionButtonText}>
            {language === 'en' ? 'Delete' : 'Sil'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderShareTab = () => (
    <View style={styles.shareTab}>
      {/* My Share Code */}
      <View style={[styles.codeSection, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {language === 'en' ? 'My Share Code' : 'Paylaşım Kodum'}
        </Text>
        <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.shareCode, { color: colors.text }]}>
            {myShareCode || 'Loading...'}
          </Text>
        </View>
        <Text style={[styles.codeDescription, { color: colors.textSecondary }]}>
          {language === 'en' 
            ? 'Share this code with friends so they can send you notes'
            : 'Bu kodu arkadaşlarınızla paylaşın ki size not gönderebilsinler'}
        </Text>
      </View>

      {/* Share Note */}
      <View style={[styles.shareSection, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {language === 'en' ? 'Share a Note' : 'Not Paylaş'}
        </Text>
        
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          placeholder={language === 'en' ? 'Enter share code' : 'Paylaşım kodu girin'}
          placeholderTextColor={colors.textSecondary}
          value={shareCode}
          onChangeText={setShareCode}
        />

        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={() => setShareModalVisible(true)}
        >
          <Text style={styles.shareButtonText}>
            {language === 'en' ? 'Select Note to Share' : 'Paylaşılacak Notu Seç'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'en' ? 'Shared Brains' : 'Ortak Akıl'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'received' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'received' ? 'white' : colors.text }
          ]}>
            {language === 'en' ? 'Received' : 'Gelen'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'sent' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'sent' ? 'white' : colors.text }
          ]}>
            {language === 'en' ? 'Sent' : 'Gönderilen'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'share' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('share')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'share' ? 'white' : colors.text }
          ]}>
            {language === 'en' ? 'Share' : 'Paylaş'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'received' && (
          <FlatList
            data={receivedNotes}
            renderItem={({ item }) => renderNoteItem({ item, type: 'received' })}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'No received notes' : 'Gelen not yok'}
              </Text>
            }
          />
        )}

        {activeTab === 'sent' && (
          <FlatList
            data={sentNotes}
            renderItem={({ item }) => renderNoteItem({ item, type: 'sent' })}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'No sent notes' : 'Gönderilen not yok'}
              </Text>
            }
          />
        )}

        {activeTab === 'share' && renderShareTab()}
      </ScrollView>

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === 'en' ? 'Select Note to Share' : 'Paylaşılacak Notu Seç'}
            </Text>
            
            <FlatList
              data={myNotes}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.modalNoteItem, 
                    { backgroundColor: colors.background },
                    selectedNote?.id === item.id && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedNote(item)}
                >
                  <Text style={[styles.modalNoteTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.modalNoteType, { color: colors.textSecondary }]}>
                    {item.box_type}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id.toString()}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShareModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {language === 'en' ? 'Cancel' : 'İptal'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  { backgroundColor: selectedNote ? colors.primary : colors.border }
                ]}
                onPress={handleShareNote}
                disabled={!selectedNote}
              >
                <Text style={[
                  styles.modalButtonText, 
                  { color: selectedNote ? 'white' : colors.textSecondary }
                ]}>
                  {language === 'en' ? 'Share' : 'Paylaş'}
                </Text>
              </TouchableOpacity>
            </View>
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
      />
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
  // Premium kullanıcılar için stiller
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  noteItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteHeader: {
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  shareTab: {
    gap: 20,
  },
  codeSection: {
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  codeContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  shareCode: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  codeDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  shareSection: {
    padding: 20,
    borderRadius: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  shareButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalNoteItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalNoteType: {
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 