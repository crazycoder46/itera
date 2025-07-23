import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function FAQScreen({ navigation }) {
  const { colors, language } = useTheme();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqs = {
    tr: {
      title: 'Sık Sorulan Sorular',
      subtitle: 'Itera ve Leitner Sistemi hakkında merak ettikleriniz',
      items: [
        {
          question: 'Leitner Sistemi nedir ve nasıl çalışır?',
          answer: 'Leitner Sistemi, 1972 yılında Sebastian Leitner tarafından geliştirilen bilimsel bir öğrenme metodudur. Spaced repetition (aralıklı tekrar) prensibine dayanır. Sistem, bilgiyi farklı kutulara ayırır ve her kutu farklı tekrar aralıklarına sahiptir. Doğru hatırladığınız bilgiler daha uzun aralıklarla tekrar edilirken, yanlış hatırladıklarınız daha sık tekrar edilir.'
        },
        {
          question: 'Itera\'yı kullanmak için ücret ödemem gerekiyor mu?',
          answer: 'Hayır! Itera tamamen ücretsizdir. Temel özellikler hiçbir ücret ödemeden kullanılabilir. Gelecekte premium özellikler eklenebilir, ancak şu an için tüm özellikler ücretsizdir.'
        },
        {
          question: 'Hangi cihazlarda Itera\'yı kullanabilirim?',
          answer: 'Itera web tarayıcınızda çalışır, bu nedenle bilgisayar, tablet ve akıllı telefon gibi internet bağlantısı olan tüm cihazlarda kullanabilirsiniz. Verileriniz bulutta senkronize edilir, böylece farklı cihazlardan erişebilirsiniz.'
        },
        {
          question: 'Notlarıma resim ekleyebilir miyim?',
          answer: 'Evet! Itera\'nın zengin editörü ile notlarınıza resim ekleyebilir, Markdown formatında yazabilir ve içeriklerinizi görsel olarak zenginleştirebilirsiniz. Bu özellik özellikle görsel öğrenenler için çok faydalıdır.'
        },
        {
          question: 'Verilerim güvende mi?',
          answer: 'Evet, verilerinizin güvenliği bizim için önceliktir. Tüm veriler şifrelenmiş olarak saklanır ve KVKK ile GDPR standartlarına uygun olarak işlenir. Hesabınızı sildiğinizde verileriniz 30 gün içinde tamamen silinir.'
        },
        {
          question: 'Günde ne kadar süre çalışmalıyım?',
          answer: 'Leitner Sistemi\'nin güzelliği, kendi hızınızda ilerleyebilmenizdir. Günde 10-15 dakika bile düzenli çalışmak, saatlerce düzensiz çalışmaktan daha etkilidir. Sistem size günlük tekrar edilecek not sayısını otomatik olarak ayarlar.'
        },
        {
          question: 'Hangi konularda Itera\'yı kullanabilirim?',
          answer: 'Itera her türlü öğrenme konusu için uygundur: dil öğrenimi, tıp, hukuk, mühendislik, tarih, coğrafya ve daha fazlası. Flashcard mantığıyla çalışan her konu için idealdir.'
        },
        {
          question: 'Offline çalışabilir miyim?',
          answer: 'Şu anda Itera internet bağlantısı gerektirir. Ancak gelecek güncellemelerde offline çalışma özelliği eklenebilir. Verileriniz bulutta saklandığı için farklı cihazlardan erişim avantajına sahipsiniz.'
        }
      ]
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you want to know about Itera and the Leitner System',
      items: [
        {
          question: 'What is the Leitner System and how does it work?',
          answer: 'The Leitner System is a scientific learning method developed by Sebastian Leitner in 1972. It is based on the spaced repetition principle. The system divides information into different boxes, each with different repetition intervals. Information you remember correctly is repeated at longer intervals, while information you get wrong is repeated more frequently.'
        },
        {
          question: 'Do I need to pay to use Itera?',
          answer: 'No! Itera is completely free. Basic features can be used without any payment. Premium features may be added in the future, but currently all features are free.'
        },
        {
          question: 'On which devices can I use Itera?',
          answer: 'Itera runs in your web browser, so you can use it on all devices with internet connection such as computers, tablets, and smartphones. Your data is synchronized in the cloud, so you can access it from different devices.'
        },
        {
          question: 'Can I add images to my notes?',
          answer: 'Yes! With Itera\'s rich editor, you can add images to your notes, write in Markdown format, and visually enrich your content. This feature is especially useful for visual learners.'
        },
        {
          question: 'Is my data safe?',
          answer: 'Yes, the security of your data is our priority. All data is stored encrypted and processed in accordance with GDPR standards. When you delete your account, your data is completely deleted within 30 days.'
        },
        {
          question: 'How much time should I study per day?',
          answer: 'The beauty of the Leitner System is that you can progress at your own pace. Even studying 10-15 minutes a day regularly is more effective than studying for hours irregularly. The system automatically adjusts the number of notes to be reviewed daily.'
        },
        {
          question: 'What subjects can I use Itera for?',
          answer: 'Itera is suitable for any learning subject: language learning, medicine, law, engineering, history, geography, and more. It\'s ideal for any subject that works with flashcard logic.'
        },
        {
          question: 'Can I work offline?',
          answer: 'Currently, Itera requires an internet connection. However, offline functionality may be added in future updates. Since your data is stored in the cloud, you have the advantage of accessing it from different devices.'
        }
      ]
    }
  };

  const currentFAQs = faqs[language] || faqs.tr;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{currentFAQs.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{currentFAQs.subtitle}</Text>
        </View>

        {currentFAQs.items.map((item, index) => (
          <View key={index} style={[styles.faqItem, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.questionContainer}
              onPress={() => toggleExpanded(index)}
            >
              <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
              <Text style={[styles.expandIcon, { color: colors.primary }]}>
                {expandedItems[index] ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            {expandedItems[index] && (
              <View style={styles.answerContainer}>
                <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: '#ffffff' }]}>
            {language === 'en' ? 'Back' : 'Geri'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  faqItem: {
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  answerContainer: {
    marginTop: 15,
    paddingLeft: 10,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 30,
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 