import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SimpleCaptcha({ onVerify, language }) {
  const { colors } = useTheme();
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showError, setShowError] = useState(false);

  // Generate new captcha
  const generateCaptcha = () => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
    setNum1(newNum1);
    setNum2(newNum2);
    setUserAnswer('');
    setIsVerified(false);
    setShowError(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleAnswerChange = (text) => {
    setUserAnswer(text);
    setShowError(false);
    
    const correctAnswer = num1 + num2;
    const userNum = parseInt(text);
    
    if (userNum === correctAnswer) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  const handleRefresh = () => {
    generateCaptcha();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {language === 'en' ? 'Security Verification' : 'Güvenlik Doğrulaması'}
      </Text>
      
      <View style={styles.captchaContainer}>
        <View style={[styles.questionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {num1} + {num2} = ?
          </Text>
        </View>
        
        <TextInput
          style={[
            styles.answerInput, 
            { 
              backgroundColor: colors.card, 
              color: colors.text, 
              borderColor: isVerified ? '#10b981' : (showError ? '#ef4444' : colors.border)
            }
          ]}
          placeholder={language === 'en' ? 'Answer' : 'Cevap'}
          placeholderTextColor={colors.textSecondary}
          value={userAnswer}
          onChangeText={handleAnswerChange}
          keyboardType="numeric"
          maxLength={3}
        />
        
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={[styles.refreshText, { color: '#ffffff' }]}>↻</Text>
        </TouchableOpacity>
      </View>
      
      {isVerified && (
        <Text style={[styles.successText, { color: '#10b981' }]}>
          ✓ {language === 'en' ? 'Verified' : 'Doğrulandı'}
        </Text>
      )}
      
      {showError && (
        <Text style={[styles.errorText, { color: '#ef4444' }]}>
          {language === 'en' ? 'Incorrect answer. Please try again.' : 'Yanlış cevap. Lütfen tekrar deneyin.'}
        </Text>
      )}
      
      <Text style={[styles.helpText, { color: colors.textSecondary }]}>
        {language === 'en' 
          ? 'Please solve the math problem above to verify you are human'
          : 'İnsan olduğunuzu doğrulamak için yukarıdaki matematik problemini çözün'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  answerInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
}); 