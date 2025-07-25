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
      icon: ''
    },
    cornell: {
      name: getText('cornellMethod'),
      content: getText('language') === 'en' 
        ? `<h2>Cornell Method Notes</h2>
<hr>
<h3>Main Topic:</h3>
<p><em>Write your main subject or topic here...</em></p>

<h3>Detailed Notes:</h3>
<p>• Key point 1</p>
<p>• Key point 2</p>
<p>• Key point 3</p>

<h3>Keywords & Concepts:</h3>
<ul>
<li><strong>Keyword 1:</strong> Definition or explanation</li>
<li><strong>Keyword 2:</strong> Definition or explanation</li>
<li><strong>Keyword 3:</strong> Definition or explanation</li>
</ul>

<h3>Summary:</h3>
<blockquote>
<p>Write a concise summary of the main ideas and key takeaways from your notes here.</p>
</blockquote>

<h3>Questions for Review:</h3>
<p>1. What is the most important concept?</p>
<p>2. How does this relate to previous topics?</p>
<p>3. What should I remember for the exam?</p>`
        : `<h2>Cornell Metodu Notları</h2>
<hr>
<h3>Ana Konu:</h3>
<p><em>Ana konuyu veya başlığı buraya yazın...</em></p>

<h3>Detaylı Notlar:</h3>
<p>• Önemli nokta 1</p>
<p>• Önemli nokta 2</p>
<p>• Önemli nokta 3</p>

<h3>Anahtar Kelimeler ve Kavramlar:</h3>
<ul>
<li><strong>Anahtar Kelime 1:</strong> Tanım veya açıklama</li>
<li><strong>Anahtar Kelime 2:</strong> Tanım veya açıklama</li>
<li><strong>Anahtar Kelime 3:</strong> Tanım veya açıklama</li>
</ul>

<h3>Özet:</h3>
<blockquote>
<p>Notlarınızdan çıkardığınız ana fikirlerin ve önemli noktaların kısa özetini buraya yazın.</p>
</blockquote>

<h3>Tekrar İçin Sorular:</h3>
<p>1. En önemli kavram nedir?</p>
<p>2. Bu, önceki konularla nasıl ilişkili?</p>
<p>3. Sınav için neyi hatırlamalıyım?</p>`,
      icon: ''
    },
    qa: {
      name: getText('qaCard'),
      content: getText('language') === 'en'
        ? `<h2>Question - Answer Card</h2>
<hr>
<h3>Question:</h3>
<p>Write your question here</p>

<h3>Answer:</h3>
<p>Write the answer here</p>

<h3>Additional Notes:</h3>
<p>Extra explanations or examples</p>`
        : `<h2>Soru - Cevap Kartı</h2>
<hr>
<h3>Soru:</h3>
<p>Sorunuzu buraya yazın</p>

<h3>Cevap:</h3>
<p>Cevabı buraya yazın</p>

<h3>Ek Notlar:</h3>
<p>Ek açıklamalar veya örnekler</p>`,
      icon: ''
    },
    meeting: {
      name: getText('meetingNotes'),
      content: getText('language') === 'en'
        ? `<h2>Meeting Notes</h2>
<hr>
<p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US')}</p>
<p><strong>Participants:</strong> </p>

<h3>Agenda:</h3>
<ul>
<li>Item 1</li>
<li>Item 2</li>
</ul>

<h3>Decisions Made:</h3>
<p>Record decisions here</p>

<h3>Action Items:</h3>
<p>List action items and responsibilities</p>`
        : `<h2>Toplantı Notları</h2>
<hr>
<p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
<p><strong>Katılımcılar:</strong> </p>

<h3>Gündem:</h3>
<ul>
<li>Madde 1</li>
<li>Madde 2</li>
</ul>

<h3>Alınan Kararlar:</h3>
<p>Kararları buraya yazın</p>

<h3>Eylem Planı:</h3>
<p>Yapılacaklar listesi ve sorumlular</p>`,
      icon: ''
    },
    literature: {
      name: getText('literatureReview'),
      content: getText('language') === 'en'
        ? `<h2>Literature Review</h2>
<hr>
<h3>Source Information:</h3>
<p><strong>Title:</strong> [Book/Article/Paper Title]</p>
<p><strong>Author(s):</strong> [Author Name(s)]</p>
<p><strong>Publication Year:</strong> [Year]</p>
<p><strong>Type:</strong> [Book/Journal Article/Conference Paper/etc.]</p>
<p><strong>Pages/Chapters:</strong> [Relevant sections]</p>

<h3>Research Question/Thesis:</h3>
<blockquote>
<p>What is the main research question or thesis statement?</p>
</blockquote>

<h3>Main Arguments and Findings:</h3>
<h4>Main Argument 1:</h4>
<p>• Evidence or data supporting this argument</p>
<p>• Author's reasoning</p>

<h4>Main Argument 2:</h4>
<p>• Evidence or data supporting this argument</p>
<p>• Author's reasoning</p>

<h3>Important Quotes:</h3>
<blockquote>
<p>"Important quote here" (Page #)</p>
</blockquote>

<h3>Methodology (if applicable):</h3>
<p>• Research method used</p>
<p>• Sample size and characteristics</p>
<p>• Data collection approach</p>

<h3>Personal Analysis:</h3>
<p><strong>Strengths:</strong></p>
<ul>
<li>What are the strong points of this work?</li>
</ul>
<p><strong>Limitations:</strong></p>
<ul>
<li>What are the weaknesses or gaps?</li>
</ul>

<h3>Connections:</h3>
<p>• How does this relate to other readings?</p>
<p>• How does it connect to course themes?</p>
<p>• Implications for further research</p>`
        : `<h2>Literatür İncelemesi</h2>
<hr>
<h3>Kaynak Bilgileri:</h3>
<p><strong>Başlık:</strong> [Kitap/Makale/Paper Başlığı]</p>
<p><strong>Yazar(lar):</strong> [Yazar İsim(ler)i]</p>
<p><strong>Yayın Yılı:</strong> [Yıl]</p>
<p><strong>Tür:</strong> [Kitap/Dergi Makalesi/Konferans Bildirisi/vb.]</p>
<p><strong>Sayfa/Bölümler:</strong> [İlgili bölümler]</p>

<h3>Araştırma Sorusu/Tez:</h3>
<blockquote>
<p>Ana araştırma sorusu veya tez ifadesi nedir?</p>
</blockquote>

<h3>Temel Argümanlar ve Bulgular:</h3>
<h4>Ana Argüman 1:</h4>
<p>• Bu argümanı destekleyen kanıt veya veri</p>
<p>• Yazarın gerekçesi</p>

<h4>Ana Argüman 2:</h4>
<p>• Bu argümanı destekleyen kanıt veya veri</p>
<p>• Yazarın gerekçesi</p>

<h3>Önemli Alıntılar:</h3>
<blockquote>
<p>"Önemli alıntıyı buraya ekleyin" (Sayfa #)</p>
</blockquote>

<h3>Metodoloji (varsa):</h3>
<p>• Kullanılan araştırma yöntemi</p>
<p>• Örneklem büyüklüğü ve özellikleri</p>
<p>• Veri toplama yaklaşımı</p>

<h3>Kişisel Analiz:</h3>
<p><strong>Güçlü Yanlar:</strong></p>
<ul>
<li>Bu çalışmanın güçlü noktaları nelerdir?</li>
</ul>
<p><strong>Sınırlılıklar:</strong></p>
<ul>
<li>Zayıflıklar veya boşluklar nelerdir?</li>
</ul>

<h3>Bağlantılar:</h3>
<p>• Bu, diğer okumalarla nasıl ilişkili?</p>
<p>• Ders temaları ile nasıl bağlantılı?</p>
<p>• İleri araştırma için çıkarımlar</p>`,
      icon: ''
    }
  });

  const handleTemplateSelect = (templateKey) => {
    setTemplate(templateKey);
    const templates = getTemplates();
    const newContent = templates[templateKey].content;
    setContent(newContent);
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    minWidth: 70,
  },
  templateButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.15,
    elevation: 2,
  },
  templateButtonText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
    textAlign: 'center',
  },
  templateButtonTextActive: {
    color: '#ffffff',
  },
  templateIcon: {
    fontSize: 14,
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