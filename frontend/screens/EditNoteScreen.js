import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EditRichTextEditor from '../components/EditRichTextEditor';
import CustomAlert from '../components/CustomAlert';

export default function EditNoteScreen({ route, navigation }) {
  const { note, box } = route.params;
  const { apiCall } = useAuth();
  const { getText } = useTheme();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: null });

  // Debug log
  console.log('EditNoteScreen - Initial content:', note.content);

  const showAlert = (title, message, onConfirm = null) => {
    setAlertConfig({ title, message, onConfirm });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      const errorMsg = getText('enterNoteTitle');
      showAlert(getText('error'), errorMsg);
      return;
    }

    setSaving(true);
    try {
      console.log('=== SAVING NOTE ===');
      console.log('Current content state:', content);
      console.log('Content length:', content.length);
      console.log('Has images:', content.includes('<img'));
      
      // İçerikteki resimlerin boyutlarını kontrol et
      const imgMatches = content.match(/<img[^>]*>/g);
      if (imgMatches) {
        console.log('Found images in content:');
        imgMatches.forEach((imgTag, index) => {
          console.log(`Image ${index}:`, imgTag);
        });
      }
      
      const response = await apiCall(`/api/notes/${note.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          box_type: note.box_type
        }),
      });

      if (response.success) {
        const successMsg = getText('noteUpdatedSuccessfully');
        showAlert(getText('success'), successMsg, () => {
          navigation.goBack();
        });
      } else {
        const errorMsg = getText('errorUpdatingNote');
        showAlert(getText('error'), errorMsg + response.message);
      }
    } catch (error) {
      console.error('Not güncelleme hatası:', error);
      const errorMsg = getText('errorUpdatingNote');
      showAlert(getText('error'), errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (title !== note.title || content !== note.content) {
      const confirmDiscard = () => {
        const confirmMsg = getText('changesNotSaved');
        if (typeof window !== 'undefined') {
          return window.confirm(confirmMsg);
        } else {
          return new Promise((resolve) => {
            Alert.alert(
              getText('changesNotSaved'),
              getText('areYouSureYouWantToExit'),
              [
                { text: getText('stay'), onPress: () => resolve(false), style: 'cancel' },
                { text: getText('exit'), onPress: () => resolve(true), style: 'destructive' }
              ]
            );
          });
        }
      };

      confirmDiscard().then((confirmed) => {
        if (confirmed) {
          navigation.goBack();
        }
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: box.color }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>
            {getText('cancel')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {getText('editNote')}
        </Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving 
                              ? getText('saving')
                              : getText('save')
            }
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Box Info */}
        <View style={styles.boxInfo}>
          <Text style={styles.boxInfoText}>
            📦 {box.name} • {box.description}
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {getText('noteTitle')}
          </Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder={getText('enterNoteTitlePlaceholder')}
            maxLength={200}
          />
        </View>

        {/* Content Input - Made larger for better user experience */}
        <View style={[styles.section, styles.contentSection]}>
          <Text style={styles.sectionTitle}>
            {getText('contentRichTextEditor')}
          </Text>
          <View style={styles.editorContainer}>
            <EditRichTextEditor
              initialContent={content}
              onContentChange={(newContent) => {
                console.log('=== CONTENT CHANGE IN EDITNOTESCREEN ===');
                console.log('Old content length:', content.length);
                console.log('New content length:', newContent.length);
                console.log('Content actually changed:', content !== newContent);
                console.log('New content preview:', newContent.substring(0, 200) + '...');
                setContent(newContent);
              }}
              noteId={note.id}
            />
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
      
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#2563eb',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  boxInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  boxInfoText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  contentSection: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  editorContainer: {
    flex: 1,
    minHeight: 400,
    borderRadius: 8,
    overflow: 'hidden',
  },
  spacer: {
    height: 40,
  },
}); 