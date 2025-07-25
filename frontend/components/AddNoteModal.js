import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import RichTextEditor from './RichTextEditor';

export default function AddNoteModal({ visible, onClose, onSave, boxType, boxName }) {
  const { getText } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('blank');
  const [editorKey, setEditorKey] = useState(0);

  const getTemplates = () => ({
    blank: {
      name: getText('blankNote'),
      content: '',
      icon: '📝'
    },
    cornell: {
      name: getText('cornellMethod'),
      content: getText('language') === 'en' 
        ? '# Note Title\n\n## Main Notes\n\n\n## Key Points\n- \n- \n- \n\n## Summary\n\n'
        : '# Not Başlığı\n\n## Ana Notlar\n\n\n## Anahtar Noktalar\n- \n- \n- \n\n## Özet\n\n',
      icon: '📋'
    },
    qa: {
      name: getText('qaCard'),
      content: getText('language') === 'en' 
        ? '# Question\n\n\n## Answer\n\n'
        : '# Soru\n\n\n## Cevap\n\n',
      icon: '❓'
    },
    meeting: {
      name: getText('meetingNote'),
      content: getText('language') === 'en'
        ? '# Meeting: [Title]\n\n**Date:** \n**Participants:** \n\n## Agenda\n- \n- \n\n## Decisions\n- \n- \n\n## Actions\n- [ ] \n- [ ] \n'
        : '# Toplantı: [Başlık]\n\n**Tarih:** \n**Katılımcılar:** \n\n## Gündem\n- \n- \n\n## Kararlar\n- \n- \n\n## Aksiyonlar\n- [ ] \n- [ ] \n',
      icon: '🏢'
    },
    literature: {
      name: getText('literatureReview'),
      content: getText('language') === 'en'
        ? '# [Source Name]\n\n**Author:** \n**Year:** \n**Type:** \n\n## Main Ideas\n\n\n## Important Quotes\n\n\n## Personal Notes\n\n'
        : '# [Kaynak Adı]\n\n**Yazar:** \n**Yıl:** \n**Tür:** \n\n## Ana Fikirler\n\n\n## Önemli Alıntılar\n\n\n## Kişisel Notlar\n\n',
      icon: '📚'
    }
  });

  const handleTemplateSelect = (templateKey) => {
    setTemplate(templateKey);
    const templates = getTemplates();
    const newContent = templates[templateKey].content;
    setContent(newContent);
    
    // Force re-render RichTextEditor with new content
    setEditorKey(prev => prev + 1);
  };

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
    setTemplate('blank');
    setEditorKey(0);
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
            
            {/* Template Selection - More aesthetic */}
            <View style={styles.templateSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
                {Object.entries(getTemplates()).map(([key, tmpl]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.templateButton,
                      template === key && styles.templateButtonActive
                    ]}
                    onPress={() => handleTemplateSelect(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.templateIcon}>{tmpl.icon}</Text>
                    <Text style={[
                      styles.templateButtonText,
                      template === key && styles.templateButtonTextActive
                    ]}>
                      {tmpl.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <RichTextEditor
              key={editorKey}
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
  templateSection: {
    marginBottom: 12,
  },
  templatesContainer: {
    marginBottom: 8,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 120,
  },
  templateButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    elevation: 5,
  },
  templateButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  templateButtonTextActive: {
    color: '#ffffff',
  },
  templateIcon: {
    fontSize: 18,
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