import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicyScreen({ navigation }) {
  const { colors, language } = useTheme();

  const content = {
    tr: {
      title: 'Gizlilik Politikası',
      lastUpdated: 'Son Güncelleme: 23 Temmuz 2025',
      sections: [
        {
          title: '1. Veri Sorumlusu',
          content: 'Bu gizlilik politikası, Itera uygulaması ("Uygulama") tarafından toplanan kişisel verilerin işlenmesi hakkında bilgi vermektedir. Veri sorumlusu olarak Itera ekibi, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında yükümlülüklerimizi yerine getirmekteyiz.'
        },
        {
          title: '2. Toplanan Veriler',
          content: 'Uygulamamız aracılığıyla aşağıdaki kişisel verilerinizi toplamaktayız:\n\n• Ad ve Soyad\n• E-posta adresi\n• Şifre (şifrelenmiş olarak)\n• Profil fotoğrafı (opsiyonel)\n• Öğrenme notları ve içerikleri\n• Uygulama kullanım verileri\n• Cihaz bilgileri (IP adresi, tarayıcı türü)'
        },
        {
          title: '3. Verilerin İşlenme Amacı',
          content: 'Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:\n\n• Kullanıcı hesabı oluşturma ve yönetimi\n• Öğrenme deneyiminin kişiselleştirilmesi\n• Teknik destek sağlanması\n• Uygulamanın geliştirilmesi\n• Yasal yükümlülüklerin yerine getirilmesi'
        },
        {
          title: '4. Verilerin Saklanması',
          content: 'Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama süreleri göz önünde bulundurularak saklanmaktadır. Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemden tamamen kaldırılır.'
        },
        {
          title: '5. Veri Güvenliği',
          content: 'Kişisel verilerinizin güvenliği için teknik ve idari tedbirler almaktayız. Veriler şifrelenmiş olarak saklanır ve yetkisiz erişime karşı korunur.'
        },
        {
          title: '6. KVKK Hakları',
          content: 'KVKK kapsamında aşağıdaki haklarınız bulunmaktadır:\n\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n• İşlenen verileriniz hakkında bilgi talep etme\n• Verilerin düzeltilmesini isteme\n• Verilerin silinmesini talep etme\n• İşleme itiraz etme\n• Verilerin aktarıldığı üçüncü kişileri öğrenme\n• Otomatik sistemler yoluyla analiz edilmesi sonucu aleyhte sonuç doğurması halinde itiraz etme\n\nBu haklarınızı kullanmak için itera.app@mail.com adresine yazılı olarak başvurabilirsiniz. Başvurunuzu en geç 30 gün içinde yanıtlayacağız.'
        },
        {
          title: '7. Veri Aktarımı ve Uluslararası Transfer',
          content: 'Kişisel verileriniz, hizmet kalitesini artırmak amacıyla güvenlik önlemleri alınarak bulut sunucu hizmetleri kullanılarak işlenebilir. Verileriniz yurt dışına aktarılması durumunda, KVKK ve GDPR gerekliliklerine uygun olarak yeterli koruma seviyesi sağlanır.'
        },
        {
          title: '8. Çerezler (Cookies)',
          content: 'Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır. Zorunlu çerezler hariç, çerez kullanımı için onayınız alınır. Çerez tercihlerinizi dilediğiniz zaman değiştirebilirsiniz.'
        },
        {
          title: '9. Veri İhlali Bildirimi',
          content: 'Kişisel verilerinizin güvenliğini tehdit eden bir veri ihlali durumunda, yasal süre içinde (72 saat) ilgili otoritelere bildirim yapılır ve etkilenen kullanıcılar derhal bilgilendirilir.'
        },
        {
          title: '10. İletişim',
          content: 'Gizlilik politikamız hakkında sorularınız için:\nE-posta: itera.app@mail.com\n\nVeri Sorumlusuna Başvuru:\nKVKK kapsamındaki haklarınızı kullanmak için yukarıdaki e-posta adresine "KVKK Başvurusu" konulu e-posta gönderebilirsiniz.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: July 23, 2025',
      sections: [
        {
          title: '1. Data Controller',
          content: 'This privacy policy provides information about the processing of personal data collected by the Itera application ("App"). As the data controller, the Itera team fulfills its obligations under applicable data protection laws.'
        },
        {
          title: '2. Data We Collect',
          content: 'We collect the following personal data through our application:\n\n• First and Last Name\n• Email address\n• Password (encrypted)\n• Profile picture (optional)\n• Learning notes and content\n• App usage data\n• Device information (IP address, browser type)'
        },
        {
          title: '3. Purpose of Processing',
          content: 'Your personal data is processed for the following purposes:\n\n• Creating and managing user accounts\n• Personalizing learning experience\n• Providing technical support\n• Improving the application\n• Fulfilling legal obligations'
        },
        {
          title: '4. Data Retention',
          content: 'Your personal data is stored for the period required by the processing purpose and considering legal retention periods. When you delete your account, your data is completely removed from the system within 30 days.'
        },
        {
          title: '5. Data Security',
          content: 'We implement technical and administrative measures to secure your personal data. Data is stored encrypted and protected against unauthorized access.'
        },
        {
          title: '6. Your Rights',
          content: 'Under data protection laws, you have the following rights:\n\n• Right to know if your personal data is being processed\n• Right to request information about your processed data\n• Right to request correction of data\n• Right to request deletion of data\n• Right to object to processing\n• Right to know third parties to whom data is transferred\n• Right to object to automated decision-making\n\nYou can contact us at itera.app@mail.com to exercise these rights. We will respond to your request within 30 days.'
        },
        {
          title: '7. Data Transfer and International Transfer',
          content: 'Your personal data may be processed using cloud server services with security measures to improve service quality. When your data is transferred abroad, adequate protection level is ensured in accordance with GDPR requirements.'
        },
        {
          title: '8. Cookies',
          content: 'We use cookies on our website to improve user experience. Except for essential cookies, your consent is obtained for cookie usage. You can change your cookie preferences at any time.'
        },
        {
          title: '9. Data Breach Notification',
          content: 'In case of a data breach that threatens the security of your personal data, we notify relevant authorities within the legal timeframe (72 hours) and immediately inform affected users.'
        },
        {
          title: '10. Contact',
          content: 'For questions about our privacy policy:\nEmail: itera.app@mail.com\n\nData Subject Requests:\nTo exercise your data protection rights, please send an email with the subject "Data Subject Request" to the above email address.'
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