import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

export default function ReviewScreen({ navigation }) {
  const { apiCall } = useAuth();
  const [reviewNotes, setReviewNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [results, setResults] = useState({ remembered: 0, forgotten: 0 });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: null });

  useEffect(() => {
    loadReviewNotes();
  }, []);

  const loadReviewNotes = async () => {
    try {
      setLoading(true);
      console.log('Tekrar notları yükleniyor...');
      const response = await apiCall('/api/notes/review', {
        method: 'GET'
      });

      console.log('Tekrar notları response:', response);

      if (response.success) {
        setReviewNotes(response.notes || []);
        console.log('Tekrar notları yüklendi:', response.notes?.length || 0);
        if ((response.notes || []).length === 0) {
          setReviewComplete(true);
        }
      } else {
        console.error('Tekrar notları yüklenemedi:', response.message);
        setReviewNotes([]);
        setReviewComplete(true);
      }
    } catch (error) {
      console.error('API hatası:', error);
      setReviewNotes([]);
      setReviewComplete(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAnswer = async (remembered) => {
    const currentNote = reviewNotes[currentIndex];
    
    try {
      const response = await apiCall(`/api/notes/${currentNote.id}/review`, {
        method: 'POST',
        body: JSON.stringify({ remembered })
      });

      if (response.success) {
        // Sonuçları güncelle
        setResults(prev => ({
          remembered: prev.remembered + (remembered ? 1 : 0),
          forgotten: prev.forgotten + (remembered ? 0 : 1)
        }));

        // Sonraki nota geç
        if (currentIndex + 1 < reviewNotes.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Tekrar tamamlandı
          setReviewComplete(true);
        }
      } else {
        showAlert('Hata', 'Tekrar kaydedilirken hata oluştu: ' + response.message);
      }
    } catch (error) {
      console.error('Tekrar kaydetme hatası:', error);
    }
  };

  const showAlert = (title, message, onConfirm = null) => {
    setAlertConfig({ title, message, onConfirm });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const renderMarkdown = (content) => {
    // Basit markdown render
    if (typeof window !== 'undefined') {
      // Web ortamı - HTML render
      let html = content
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
        <Text style={styles.noteContent}>
          {cleanContent}
        </Text>
      );
    }
  };

  const handleFinishReview = async () => {
    // Sadece gerçek tekrar yapıldıysa günlük tekrarı tamamlandı olarak işaretle
    if (reviewNotes.length > 0) {
      try {
        const response = await apiCall('/api/notes/complete-daily-review', {
          method: 'POST'
        });
        
        if (response.success) {
          console.log('Günlük tekrar tamamlandı olarak işaretlendi');
        }
      } catch (error) {
        console.error('Günlük tekrar tamamlama hatası:', error);
      }
    }
    
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Tekrar notları yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (reviewComplete || reviewNotes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedTitle}>Harika İş!</Text>
          <Text style={styles.completedText}>
            {reviewNotes.length === 0 
              ? 'Bugün tekrar edilecek not yok.'
              : `Bugün ${results.remembered + results.forgotten} notu tekrar ettin!`
            }
          </Text>
          
          {reviewNotes.length > 0 && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultItem}>
                <Text style={styles.resultNumber}>{results.remembered}</Text>
                <Text style={styles.resultLabel}>Hatırladım</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultNumber}>{results.forgotten}</Text>
                <Text style={styles.resultLabel}>Hatırlamadım</Text>
              </View>
            </View>
          )}

          <Text style={styles.motivationText}>
            Tekrar serin şimdi {reviewNotes.length > 0 ? '2-7 gün!' : 'Yeni notlar ekle!'}
          </Text>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinishReview}
          >
            <Text style={styles.finishButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
        
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

  const currentNote = reviewNotes[currentIndex];
  const progress = ((currentIndex + 1) / reviewNotes.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {reviewNotes.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      {/* Note Content */}
      <ScrollView style={styles.noteContainer}>
        <Text style={styles.noteTitle}>{currentNote.title}</Text>
        <View style={styles.noteContentContainer}>
          {renderMarkdown(currentNote.content)}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => handleReviewAnswer(false)}
        >
          <Text style={styles.forgotButtonText}>✗</Text>
          <Text style={styles.buttonLabel}>Hatırlamadım</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rememberedButton}
          onPress={() => handleReviewAnswer(true)}
        >
          <Text style={styles.rememberedButtonText}>✓</Text>
          <Text style={styles.buttonLabel}>Hatırladım</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#2563eb',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  noteContainer: {
    flex: 1,
    padding: 24,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  noteContentContainer: {
    minHeight: 200,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  forgotButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  forgotButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rememberedButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  rememberedButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  completedText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  resultsContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  motivationText: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  finishButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 