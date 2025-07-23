import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TermsOfServiceScreen({ navigation }) {
  const { colors, language } = useTheme();

  const content = {
    tr: {
      title: 'Kullanım Şartları',
      lastUpdated: 'Son Güncelleme: 23 Temmuz 2025',
      sections: [
        {
          title: '1. Kabul ve Onay',
          content: 'Bu kullanım şartları ("Şartlar"), Itera uygulamasını ("Uygulama") kullanımınızı düzenler. Uygulamayı kullanarak bu şartları kabul etmiş sayılırsınız.'
        },
        {
          title: '2. Hizmet Tanımı',
          content: 'Itera, Leitner Metodu tabanlı bir öğrenme uygulamasıdır. Uygulama, spaced repetition tekniği ile öğrenme deneyiminizi optimize eder ve bilgiyi kalıcı hale getirmenize yardımcı olur.'
        },
        {
          title: '3. Kullanıcı Yükümlülükleri',
          content: 'Uygulamayı kullanırken:\n\n• Doğru ve güncel bilgiler sağlayacaksınız\n• Hesap güvenliğinizi koruyacaksınız\n• Başkalarının haklarını ihlal etmeyeceksiniz\n• Uygulamayı kötüye kullanmayacaksınız\n• Yasa dışı içerik paylaşmayacaksınız'
        },
        {
          title: '4. Hesap Güvenliği',
          content: 'Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi güvenli tutmalı ve yetkisiz erişim durumunda derhal bizimle iletişime geçmelisiniz.'
        },
        {
          title: '5. İçerik ve Telif Hakları',
          content: 'Uygulamaya yüklediğiniz içerikler size aittir. Ancak, hizmetimizi sağlayabilmek için bu içerikleri kullanma hakkını bize vermiş olursunuz. Başkalarının telif haklarını ihlal eden içerik yüklemeyiniz.'
        },
        {
          title: '6. Hizmet Kesintileri',
          content: 'Teknik bakım, güncelleme veya öngörülemeyen durumlar nedeniyle hizmetimizde kesintiler yaşanabilir. Bu durumlardan dolayı sorumluluk kabul etmemekteyiz.'
        },
        {
          title: '7. Sorumluluk Reddi',
          content: 'Uygulama "olduğu gibi" sunulmaktadır. Hizmetin kesintisiz veya hatasız olacağına dair garanti vermemekteyiz. Uygulamanın kullanımından doğabilecek zararlardan sorumlu değiliz.'
        },
        {
          title: '8. Hesap İptali',
          content: 'Bu şartları ihlal etmeniz durumunda hesabınızı askıya alabilir veya iptal edebiliriz. Siz de istediğiniz zaman hesabınızı kapatabilirsiniz.'
        },
        {
          title: '9. Fikri Mülkiyet Hakları',
          content: 'Itera uygulaması, logosu, tasarımı ve tüm içeriği fikri mülkiyet haklarımız kapsamında korunmaktadır. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.'
        },
        {
          title: '10. Uygulanacak Hukuk',
          content: 'Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklar İstanbul mahkemelerinde çözülecektir.'
        },
        {
          title: '11. Değişiklikler',
          content: 'Bu şartları zaman zaman güncelleyebiliriz. Önemli değişiklikler hakkında sizi e-posta yoluyla veya uygulama içi bildirimlerle bilgilendireceğiz. Değişiklikler yayınlandıktan sonra uygulamayı kullanmaya devam etmeniz yeni şartları kabul ettiğiniz anlamına gelir.'
        },
        {
          title: '12. İletişim',
          content: 'Kullanım şartları hakkında sorularınız için:\nE-posta: itera.app@mail.com\n\nHukuki Uyuşmazlıklar:\nBu şartlarla ilgili herhangi bir uyuşmazlık durumunda öncelikle dostane çözüm yolları denenir. Çözüm bulunamazsa İstanbul mahkemeleri yetkilidir.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: July 23, 2025',
      sections: [
        {
          title: '1. Acceptance and Agreement',
          content: 'These terms of service ("Terms") govern your use of the Itera application ("App"). By using the App, you are deemed to have accepted these terms.'
        },
        {
          title: '2. Service Description',
          content: 'Itera is a learning application based on the Leitner Method. The App optimizes your learning experience using spaced repetition technique and helps you make knowledge permanent.'
        },
        {
          title: '3. User Obligations',
          content: 'When using the App, you will:\n\n• Provide accurate and current information\n• Protect your account security\n• Not violate others\' rights\n• Not misuse the App\n• Not share illegal content'
        },
        {
          title: '4. Account Security',
          content: 'You are responsible for your account security. You must keep your password secure and contact us immediately in case of unauthorized access.'
        },
        {
          title: '5. Content and Copyright',
          content: 'Content you upload to the App belongs to you. However, you grant us the right to use this content to provide our service. Do not upload content that violates others\' copyrights.'
        },
        {
          title: '6. Service Interruptions',
          content: 'Our service may experience interruptions due to technical maintenance, updates, or unforeseen circumstances. We do not accept responsibility for such situations.'
        },
        {
          title: '7. Disclaimer of Liability',
          content: 'The App is provided "as is". We do not guarantee that the service will be uninterrupted or error-free. We are not responsible for damages that may arise from using the App.'
        },
        {
          title: '8. Account Termination',
          content: 'We may suspend or terminate your account if you violate these terms. You may also close your account at any time.'
        },
        {
          title: '9. Intellectual Property Rights',
          content: 'The Itera application, logo, design, and all content are protected under our intellectual property rights. Unauthorized use, copying, or distribution is prohibited.'
        },
        {
          title: '10. Applicable Law',
          content: 'These terms are subject to the laws of the Republic of Turkey. Disputes will be resolved in Istanbul courts.'
        },
        {
          title: '11. Changes',
          content: 'We may update these terms from time to time. We will inform you about significant changes via email or in-app notifications. Continuing to use the app after changes are published means you accept the new terms.'
        },
        {
          title: '12. Contact',
          content: 'For questions about terms of service:\nEmail: itera.app@mail.com\n\nLegal Disputes:\nIn case of any dispute regarding these terms, amicable solutions will be sought first. If no solution is found, Istanbul courts have jurisdiction.'
        }
      ]
    }
  };

  const currentContent = content[language] || content.tr;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{currentContent.title}</Text>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>{currentContent.lastUpdated}</Text>
        </View>

        {currentContent.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
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
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
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