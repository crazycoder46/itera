import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  Modal, 
  StyleSheet,
  RefreshControl 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';

export default function SharedBrainsScreen({ navigation }) {
  const { user, apiCall, language } = useAuth();
  const { colors, getText } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', 'share'
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [myShareCode, setMyShareCode] = useState('');
  const [myNotes, setMyNotes] = useState([]);
  const [receivedNotes, setReceivedNotes] = useState([]);
  const [sentNotes, setSentNotes] = useState([]);
  
  // Share modal states
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [shareCode, setShareCode] = useState('');
  
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

  // Premium kullanıcılar için gerçek Shared Brains özelliği
  const loadData = async () => {
    try {
      // Share code'u al (geçici olarak kullanıcı ID'sinden oluştur)
      if (user && user.id) {
        const tempShareCode = 'USR' + user.id.toString().padStart(7, '0');
        setMyShareCode(tempShareCode);
      }

      // Notlarımı al (geçici olarak direkt notes API'den)
      const myNotesResponse = await apiCall('/api/notes');
      if (myNotesResponse.success) {
        setMyNotes(myNotesResponse.notes);
      }

      // Gelen notları al
      const receivedResponse = await apiCall('/shared/received');
      if (receivedResponse.success) {
        setReceivedNotes(receivedResponse.notes);
      }

      // Gönderilen notları al
      const sentResponse = await apiCall('/shared/sent');
      if (sentResponse.success) {
        setSentNotes(sentResponse.notes);
      }
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleShareNote = async () => {
    if (!shareCode.trim()) {
      Alert.alert('Hata', 'Paylaşım kodu gerekli');
      return;
    }

    try {
      const response = await apiCall('/shared/share-note', {
        method: 'POST',
        body: JSON.stringify({
          noteId: selectedNote.id,
          shareCode: shareCode.trim()
        })
      });

      if (response.success) {
        Alert.alert('Başarılı', 'Not başarıyla paylaşıldı');
        setShareModalVisible(false);
        setShareCode('');
        setSelectedNote(null);
        loadData(); // Listeyi yenile
      } else {
        Alert.alert('Hata', response.message || 'Not paylaşılamadı');
      }
    } catch (error) {
      console.error('Share note error:', error);
      Alert.alert('Hata', 'Not paylaşılamadı');
    }
  };

  const handleAcceptNote = async (noteId) => {
    try {
      const response = await apiCall(`/shared/accept-note/${noteId}`, {
        method: 'POST'
      });

      if (response.success) {
        Alert.alert('Başarılı', 'Not notlarınıza eklendi');
        loadData(); // Listeyi yenile
      } else {
        Alert.alert('Hata', response.message || 'Not eklenemedi');
      }
    } catch (error) {
      console.error('Accept note error:', error);
      Alert.alert('Hata', 'Not eklenemedi');
    }
  };

  const handleDeleteNote = async (noteId, type) => {
    try {
      const endpoint = type === 'received' ? `/shared/received/${noteId}` : `/shared/sent/${noteId}`;
      const response = await apiCall(endpoint, {
        method: 'DELETE'
      });

      if (response.success) {
        Alert.alert('Başarılı', 'Not silindi');
        loadData(); // Listeyi yenile
      } else {
        Alert.alert('Hata', response.message || 'Not silinemedi');
      }
    } catch (error) {
      console.error('Delete note error:', error);
      Alert.alert('Hata', 'Not silinemedi');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          🧠 {language === 'en' ? 'Shared Brains' : 'Ortak Akıl'}
        </Text>
        <Text style={[styles.shareCode, { color: colors.primary }]}>
          {language === 'en' ? 'My Code:' : 'Kodum:'} {myShareCode || 'Loading...'}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'received' ? 'white' : colors.text }]}>
            📥 {language === 'en' ? 'Received' : 'Gelen'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'sent' ? 'white' : colors.text }]}>
            📤 {language === 'en' ? 'Sent' : 'Gönderilen'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'share' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('share')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'share' ? 'white' : colors.text }]}>
            🤝 {language === 'en' ? 'Share' : 'Paylaş'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'received' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {language === 'en' ? 'Received Notes' : 'Gelen Notlar'}
            </Text>
            {receivedNotes.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'No received notes yet' : 'Henüz gelen not yok'}
              </Text>
            ) : (
              receivedNotes.map((note) => (
                <View key={note.id} style={[styles.noteCard, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
                  <Text style={[styles.noteSender, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'From:' : 'Gönderen:'} {note.first_name} {note.last_name}
                  </Text>
                  <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                    {formatDate(note.shared_at)}
                  </Text>
                  <View style={styles.noteActions}>
                    {!note.is_accepted && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleAcceptNote(note.id)}
                      >
                        <Text style={styles.actionButtonText}>
                          {language === 'en' ? 'Accept' : 'Kabul Et'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                      onPress={() => handleDeleteNote(note.id, 'received')}
                    >
                      <Text style={styles.actionButtonText}>
                        {language === 'en' ? 'Delete' : 'Sil'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'sent' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {language === 'en' ? 'Sent Notes' : 'Gönderilen Notlar'}
            </Text>
            {sentNotes.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'No sent notes yet' : 'Henüz gönderilen not yok'}
              </Text>
            ) : (
              sentNotes.map((note) => (
                <View key={note.id} style={[styles.noteCard, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
                  <Text style={[styles.noteSender, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'To:' : 'Alıcı:'} {note.first_name} {note.last_name}
                  </Text>
                  <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                    {formatDate(note.shared_at)}
                  </Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                      onPress={() => handleDeleteNote(note.id, 'sent')}
                    >
                      <Text style={styles.actionButtonText}>
                        {language === 'en' ? 'Delete' : 'Sil'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'share' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {language === 'en' ? 'Share Your Notes' : 'Notlarınızı Paylaşın'}
            </Text>
            {myNotes.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'No notes to share' : 'Paylaşılacak not yok'}
              </Text>
            ) : (
              myNotes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.noteCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => {
                    setSelectedNote(note);
                    setShareModalVisible(true);
                  }}
                >
                  <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
                  <Text style={[styles.noteType, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Type:' : 'Tür:'} {note.box_type}
                  </Text>
                  <Text style={[styles.shareHint, { color: colors.primary }]}>
                    {language === 'en' ? 'Tap to share' : 'Paylaşmak için dokun'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === 'en' ? 'Share Note' : 'Not Paylaş'}
            </Text>
            
            <Text style={[styles.modalNoteTitle, { color: colors.text }]}>
              {selectedNote?.title}
            </Text>
            
            <TextInput
              style={[styles.shareCodeInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder={language === 'en' ? 'Enter share code' : 'Paylaşım kodunu girin'}
              placeholderTextColor={colors.textSecondary}
              value={shareCode}
              onChangeText={setShareCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textSecondary }]}
                onPress={() => setShareModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {language === 'en' ? 'Cancel' : 'İptal'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleShareNote}
              >
                <Text style={styles.modalButtonText}>
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
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shareCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteSender: {
    fontSize: 14,
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
    marginBottom: 12,
  },
  noteType: {
    fontSize: 14,
    marginBottom: 8,
  },
  shareHint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  shareCodeInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Coming soon styles (premium olmayan kullanıcılar için)
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