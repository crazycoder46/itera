import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import RichTextEditor from './RichTextEditor';

export default function AddNoteModal({ visible, onClose, onSave, boxType, boxName }) {
  const { getText } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');



  const handleSave = () => {
    if (!title.trim()) {
      const errorMsg = getText('enterNoteTitle');
      if (typeof window !== 'undefined') {
        window.alert(errorMsg);
      } else {
        Alert.alert(getText('error'), errorMsg);
      }
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      box_type: boxType
    };

    onSave(noteData);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>
              {getText('cancel')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {`${getText('newNoteTitle')} - ${boxName}`}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {getText('save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
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
              maxLength={100}
            />
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getText('richTextEditor')}
            </Text>
            <RichTextEditor
              initialContent={content}
              onContentChange={setContent}
            />
          </View>

          {/* Markdown Help */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getText('language') === 'en' ? 'Markdown Help' : 'Markdown Yardımı'}
            </Text>
            <View style={styles.markdownHelp}>
              <Text style={styles.markdownHelpText}>
                {getText('language') === 'en' ? (
                  '# Large Header\n## Medium Header\n**Bold Text**\n*Italic Text*\n- List item\n> Quote\n`Code`'
                ) : (
                  '# Büyük Başlık\n## Orta Başlık\n**Kalın Metin**\n*İtalik Metin*\n- Liste öğesi\n> Alıntı\n`Kod`'
                )}
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </Modal>
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  templatesContainer: {
    marginBottom: 8,
  },
  templateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  templateButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  templateButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  templateButtonTextActive: {
    color: '#fff',
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
  contentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 200,
  },
  markdownHelp: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  markdownHelpText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  spacer: {
    height: 40,
  },
}); 