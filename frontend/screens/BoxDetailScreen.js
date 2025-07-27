import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AddNoteModal from '../components/AddNoteModal';
import CustomAlert from '../components/CustomAlert';

export default function BoxDetailScreen({ route, navigation }) {
  const { box } = route.params;
  const { apiCall } = useAuth();
  const { getText } = useTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    loadBoxNotes();
  }, []);

  // Sayfa odaklandığında notları yenile (düzenleme sonrası)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadBoxNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false))
    });
    setAlertVisible(true);
  };

  const loadBoxNotes = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/api/notes?box_type=${box.id}`, {
        method: 'GET'
      });

      if (response.success) {
        setNotes(response.notes || []);
      } else {
        setNotes([]);
      }
    } catch (error) {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      const response = await apiCall('/api/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });

      if (response.success) {
        loadBoxNotes(); // Notları yeniden yükle
        const successMsg = getText('noteAddedSuccess');
        showAlert(getText('success'), successMsg, 'success');
      } else {
        const errorMsg = getText('noteAddError');
        showAlert(getText('error'), errorMsg + response.message, 'error');
      }
    } catch (error) {
      console.error('Not ekleme hatası:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    showAlert(
      getText('deleteNoteTitle'),
      getText('deleteNoteConfirm'),
      'warning',
      async () => {
        setAlertVisible(false);
        const confirmed = true;
        if (!confirmed) return;

        try {
          const response = await apiCall(`/api/notes/${noteId}`, {
            method: 'DELETE'
          });

          if (response.success) {
            loadBoxNotes(); // Notları yeniden yükle
            const successMsg = getText('noteDeletedSuccess');
            showAlert(getText('success'), successMsg, 'success');
          } else {
            const errorMsg = getText('noteDeleteError');
            showAlert(getText('error'), errorMsg + response.message, 'error');
          }
        } catch (error) {
          console.error('Not silme hatası:', error);
        }
      }
    );
  };

  const handleNotePress = (note) => {
    navigation.navigate('NoteDetail', { note, box });
  };

  const handleEditNote = (note) => {
    navigation.navigate('EditNote', { note, box });
  };

  const renderMarkdown = (content) => {
    // Basit markdown render (geliştirilecek)
    let rendered = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br/>');
    
    return rendered;
  };

  const truncateContent = (content, maxLength = 150) => {
    // Remove HTML img tags and other HTML content for security
    let cleanContent = content
      .replace(/<img[^>]*>/g, '[Resim]') // Replace img tags with [Resim]
      .replace(/<[^>]*>/g, '') // Remove all other HTML tags
      .replace(/[#*`>\-]/g, '') // Remove markdown characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Trim whitespace
    
    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength) + '...';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: box.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{getText('backButton')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{box.name}</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ {getText('newNote')}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>{box.description}</Text>
          <Text style={styles.noteCount}>
                          {notes.length} {notes.length === 1 ? getText('note') : getText('notes')} • {box.interval > 0 
                              ? `${getText('language') === 'en' ? 'every' : ''} ${box.interval} ${getText('everyXDays')}`
                              : getText('completed')
            }
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {getText('loadingNotes')}
            </Text>
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>
              {getText('noNotesYet')}
            </Text>
            <Text style={styles.emptyText}>
              {getText('emptyBoxMessage')}
            </Text>
          </View>
        ) : (
          <View style={styles.notesContainer}>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <TouchableOpacity
                  style={styles.noteContent}
                  onPress={() => handleNotePress(note)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.notePreview}>
                    {truncateContent(note.content)}
                  </Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditNote(note)}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Add Note Modal */}
      <AddNoteModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveNote}
        boxType={box.id}
        boxName={box.name}
      />
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 24,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  noteCount: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  notesContainer: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noteContent: {
    padding: 16,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  spacer: {
    height: 50,
  },
}); 