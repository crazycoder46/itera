import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SharedBrainsScreen({ navigation }) {
  const { apiCall, isPremium, getProfile } = useAuth();
  const { colors, getText } = useTheme();
  
  // States
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent' | 'share'
  const [receivedNotes, setReceivedNotes] = useState([]);
  const [sentNotes, setSentNotes] = useState([]);
  const [myNotes, setMyNotes] = useState([]);
  const [myShareCode, setMyShareCode] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kullanıcı bilgilerini yenile (is_premium alanını almak için)
    getProfile();
    loadData();
  }, []);

  // Sayfa odaklandığında verileri yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    await Promise.all([
      loadMyShareCode(),
      loadReceivedNotes(),
      loadSentNotes(),
      loadMyNotes()
    ]);
  };

  const loadMyShareCode = async () => {
    try {
      const response = await apiCall('/api/shared/my-code');
      if (response.success) {
        setMyShareCode(response.shareCode);
      }
    } catch (error) {
      console.error('Share code error:', error);
    }
  };

  const loadReceivedNotes = async () => {
    try {
      const response = await apiCall('/api/shared/received');
      if (response.success) {
        setReceivedNotes(response.notes);
      }
    } catch (error) {
      console.error('Received notes error:', error);
    }
  };

  const loadSentNotes = async () => {
    try {
      const response = await apiCall('/api/shared/sent');
      if (response.success) {
        setSentNotes(response.notes);
      }
    } catch (error) {
      console.error('Sent notes error:', error);
    }
  };

  const loadMyNotes = async () => {
    try {
      const response = await apiCall('/api/shared/my-notes');
      if (response.success) {
        setMyNotes(response.notes);
      }
    } catch (error) {
      console.error('My notes error:', error);
    }
  };

  const handleShareNote = async () => {
    if (!selectedNoteId || !shareCode.trim()) {
      Alert.alert('Hata', 'Lütfen not seçin ve paylaşım kodunu girin');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall('/api/shared/share-note', {
        method: 'POST',
        body: JSON.stringify({
          noteId: selectedNoteId,
          shareCode: shareCode.trim()
        })
      });

      if (response.success) {
        Alert.alert('Başarılı', getText('shareSuccess'));
        setShowShareModal(false);
        setShareCode('');
        setSelectedNoteId('');
        loadSentNotes(); // Gönderilen notları yenile
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Not paylaşılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptNote = async (noteId) => {
    try {
      const response = await apiCall(`/api/shared/accept-note/${noteId}`, {
        method: 'POST'
      });

      if (response.success) {
        Alert.alert('Başarılı', getText('noteAdded'));
        loadReceivedNotes(); // Gelen notları yenile
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Not eklenemedi');
    }
  };

  const handleDeleteReceivedNote = async (noteId) => {
    try {
      const response = await apiCall(`/api/shared/received/${noteId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        loadReceivedNotes(); // Gelen notları yenile
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Not silinemedi');
    }
  };

  const handleDeleteSentNote = async (noteId) => {
    try {
      const response = await apiCall(`/api/shared/sent/${noteId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        loadSentNotes(); // Gönderilen notları yenile
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Not silinemedi');
    }
  };

  // Premium olmayan kullanıcılar için yükseltme ekranı
  if (!isPremium()) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.premiumContainer}>
          <Text style={styles.premiumIcon}>🧠✨</Text>
          <Text style={[styles.premiumTitle, { color: colors.text }]}>
            {getText('sharedBrains')}
          </Text>
          <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>
            {getText('language') === 'en' 
              ? 'Share notes with other users and collaborate!'
              : 'Diğer kullanıcılarla not paylaş ve işbirliği yap!'
            }
          </Text>
          
          <View style={styles.premiumFeatures}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📤</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {getText('language') === 'en' ? 'Share your notes' : 'Notlarını paylaş'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📥</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {getText('language') === 'en' ? 'Receive notes from others' : 'Başkalarından not al'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔗</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {getText('language') === 'en' ? 'Unique sharing codes' : 'Benzersiz paylaşım kodları'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {getText('language') === 'en' ? 'Instant collaboration' : 'Anında işbirliği'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.alert(getText('language') === 'en' 
                  ? 'Premium features coming soon!\n\n• Shared Brains\n• Advanced Statistics\n• Unlimited Notes' 
                  : 'Premium özellikler yakında gelecek!\n\n• Shared Brains\n• Gelişmiş İstatistikler\n• Sınırsız Not'
                );
              }
            }}
          >
            <Text style={styles.upgradeButtonText}>
              {getText('language') === 'en' ? '⭐ Upgrade to Premium' : '⭐ Premium\'a Yükselt'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    shareButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    shareButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    shareCodeSection: {
      marginHorizontal: 24,
      marginBottom: 16,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    shareCodeLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    shareCodeText: {
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 24,
      marginBottom: 16,
      borderRadius: 8,
      overflow: 'hidden',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
    },
    noteCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    noteHeader: {
      marginBottom: 8,
    },
    noteTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    noteMeta: {
      fontSize: 14,
    },
    noteContent: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 8,
    },
    noteDate: {
      fontSize: 12,
      marginBottom: 12,
    },
    noteActions: {
      flexDirection: 'row',
      gap: 8,
    },
    acceptButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    deleteButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
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
      borderRadius: 16,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    noteSelector: {
      maxHeight: 200,
      marginBottom: 16,
    },
    noteOption: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    noteOptionText: {
      fontSize: 16,
      flex: 1,
    },
    noteOptionBox: {
      fontSize: 12,
      marginLeft: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      marginBottom: 20,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Premium ekranı stilleri
    premiumContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    premiumIcon: {
      fontSize: 64,
      marginBottom: 24,
    },
    premiumTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    premiumSubtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    premiumFeatures: {
      width: '100%',
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    featureIcon: {
      fontSize: 24,
      marginRight: 16,
      width: 32,
    },
    featureText: {
      fontSize: 16,
      flex: 1,
    },
    upgradeButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
    },
    upgradeButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {getText('sharedBrains')}
        </Text>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowShareModal(true)}
        >
          <Text style={styles.shareButtonText}>+ {getText('shareNote')}</Text>
        </TouchableOpacity>
      </View>

      {/* My Share Code */}
      <View style={[styles.shareCodeSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.shareCodeLabel, { color: colors.text }]}>
          {getText('myShareCode')}:
        </Text>
        <Text style={[styles.shareCodeText, { color: colors.primary }]}>
          {myShareCode}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'received' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'received' ? '#fff' : colors.text }
          ]}>
            {getText('receivedNotes')}
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
            { color: activeTab === 'sent' ? '#fff' : colors.text }
          ]}>
            {getText('sentNotes')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'received' && (
          <View>
            {receivedNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {getText('noReceivedNotes')}
                </Text>
              </View>
            ) : (
              receivedNotes.map((note, index) => (
                <View key={index} style={[styles.noteCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.noteHeader}>
                    <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
                    <Text style={[styles.noteMeta, { color: colors.textSecondary }]}>
                      {getText('from')}: {note.first_name} {note.last_name}
                    </Text>
                  </View>
                  <Text style={[styles.noteContent, { color: colors.text }]} numberOfLines={3}>
                    {note.content}
                  </Text>
                  <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                    {new Date(note.shared_at).toLocaleDateString()}
                  </Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={[styles.acceptButton, { backgroundColor: colors.success }]}
                      onPress={() => handleAcceptNote(note.id)}
                    >
                      <Text style={styles.actionButtonText}>{getText('addToMyNotes')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.error }]}
                      onPress={() => handleDeleteReceivedNote(note.id)}
                    >
                      <Text style={styles.actionButtonText}>{getText('delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'sent' && (
          <View>
            {sentNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {getText('noSentNotes')}
                </Text>
              </View>
            ) : (
              sentNotes.map((note, index) => (
                <View key={index} style={[styles.noteCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.noteHeader}>
                    <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
                    <Text style={[styles.noteMeta, { color: colors.textSecondary }]}>
                      {getText('to')}: {note.first_name} {note.last_name}
                    </Text>
                  </View>
                  <Text style={[styles.noteContent, { color: colors.text }]} numberOfLines={3}>
                    {note.content}
                  </Text>
                  <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                    {new Date(note.shared_at).toLocaleDateString()}
                  </Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.error }]}
                      onPress={() => handleDeleteSentNote(note.id)}
                    >
                      <Text style={styles.actionButtonText}>{getText('delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getText('shareNote')}
            </Text>

            {/* Note Selection */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {getText('selectNote')}
            </Text>
            <ScrollView style={styles.noteSelector} showsVerticalScrollIndicator={false}>
              {myNotes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={[
                    styles.noteOption,
                    { backgroundColor: selectedNoteId === note.id ? colors.primary : colors.background },
                  ]}
                  onPress={() => setSelectedNoteId(note.id)}
                >
                  <Text style={[
                    styles.noteOptionText,
                    { color: selectedNoteId === note.id ? '#fff' : colors.text }
                  ]}>
                    {note.title}
                  </Text>
                  <Text style={[
                    styles.noteOptionBox,
                    { color: selectedNoteId === note.id ? '#fff' : colors.textSecondary }
                  ]}>
                    {note.box_type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Share Code Input */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {getText('shareCode')}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder={getText('enterShareCode')}
              placeholderTextColor={colors.textSecondary}
              value={shareCode}
              onChangeText={setShareCode}
              autoCapitalize="characters"
            />

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textSecondary }]}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={styles.modalButtonText}>{getText('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleShareNote}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? getText('loading') : getText('shareNote')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 