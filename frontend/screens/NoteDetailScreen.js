import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function NoteDetailScreen({ route, navigation }) {
  const { note: initialNote, box } = route.params;
  const { apiCall } = useAuth();
  const { getText } = useTheme();
  const [note, setNote] = useState(initialNote);

  // Sayfa odaklandığında notu yenile (düzenleme sonrası)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNote();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNote = async () => {
    try {
      const response = await apiCall(`/api/notes/${note.id}`, {
        method: 'GET'
      });

      if (response.success && response.note) {
        setNote(response.note);
      }
    } catch (error) {
      console.error('Not yüklenirken hata:', error);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditNote', { note, box });
  };

  const renderMarkdown = (content) => {
    // Basit markdown render - web için HTML, mobil için styled text
    if (typeof window !== 'undefined') {
      // Web ortamı - HTML render
      let html = content
        .replace(/<img[^>]*>/g, '<div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center; color: #6b7280; font-style: italic; margin: 12px 0;">📷 [Resim]</div>') // Replace img tags safely
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: bold; margin: 16px 0; color: #1f2937;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: bold; margin: 14px 0; color: #1f2937;">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: bold; margin: 12px 0; color: #1f2937;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: bold;">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em style="font-style: italic;">$1</em>')
        .replace(/`(.*?)`/gim, '<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 14px;">$1</code>')
        .replace(/```([\s\S]*?)```/gim, '<pre style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 14px; margin: 12px 0;"><code>$1</code></pre>')
        .replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #d1d5db; margin: 12px 0; padding-left: 16px; color: #6b7280; font-style: italic;">$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li style="margin: 4px 0;">$1</li>')
        .replace(/\n/gim, '<br/>');

      return (
        <div 
          style={{ 
            fontSize: '16px', 
            lineHeight: '1.6', 
            color: '#374151',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else {
      // Mobil ortam - basit text render with image filtering
      const cleanContent = content.replace(/<img[^>]*>/g, '[Resim]');
      return (
        <Text style={styles.content}>
          {cleanContent}
        </Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: box.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Text style={styles.backButtonText}>{getText('backButton')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{note.title}</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                      <Text style={styles.editButtonText}>{getText('edit')}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          {/* Note Info */}
          <View style={styles.noteInfo}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>
                📅 {new Date(note.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <Text style={styles.metaText}>
                📦 {box.name}
              </Text>
            </View>
          </View>

          {/* Rendered Content */}
          <View style={styles.markdownContainer}>
            {renderMarkdown(note.content)}
          </View>

          <View style={styles.spacer} />
        </View>
      </ScrollView>
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
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  noteInfo: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  markdownContainer: {
    minHeight: 200,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  spacer: {
    height: 50,
  },
}); 