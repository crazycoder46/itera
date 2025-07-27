import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { theme, language } = useAuth();

  // Tema bazlı renkler
  const colors = {
    light: {
      primary: '#a67c52',
      background: '#fefdfb',
      surface: '#f7f5f2',
      text: '#2c1810',
      textSecondary: '#6b5b4f',
      border: '#e8e3dc',
      card: '#ffffff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    dark: {
      primary: '#c4956c',
      background: '#1a1611',
      surface: '#2d251e',
      text: '#f5f1eb',
      textSecondary: '#b8a894',
      border: '#3d342a',
      card: '#2d251e',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    }
  };

  // Dil bazlı metinler
  const texts = {
    tr: {
      // Navigation
      home: 'Ana Sayfa',
      calendar: 'Takvim',
      profile: 'Profil',
      sharedBrains: 'Ortak Akıl',
      
      // Common
      loading: 'Yükleniyor...',
      save: 'Kaydet',
      saving: 'Kaydediliyor...',
      cancel: 'İptal',
      edit: 'Düzenle',
      delete: 'Sil',
      add: 'Ekle',
      back: 'Geri',
      backButton: '← Geri',
      next: 'İleri',
      previous: 'Önceki',
      close: 'Kapat',
      
      // Auth
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      logout: 'Çıkış Yap',
      email: 'E-posta',
      password: 'Şifre',
      firstName: 'Ad',
      lastName: 'Soyad',
      
      // Home
      reviewStart: 'Tekrar Başla',
      reviewComplete: 'Harika İş! Bugünlük bu kadar.',
      addNote: 'Not Ekle',
      
      // Profile
      userInfo: 'Kullanıcı Bilgileri',
      changePassword: 'Şifre Değiştir',
      settings: 'Ayarlar',
      language: 'Dil Seçimi',
      theme: 'Tema',
      plan: 'Plan',
      changePhoto: 'Fotoğraf Değiştir',
      newPassword: 'Yeni Şifre',
      confirmPassword: 'Yeni Şifre (Tekrar)',
      
      // Notes
      notes: 'Notlar',
      noteTitle: 'Not Başlığı',
      noteContent: 'Not İçeriği',
      createNote: 'Not Oluştur',
      editNote: 'Not Düzenle',
      deleteNote: 'Not Sil',
      
      // Review
      review: 'Tekrar',
      remembered: 'Hatırladım',
      forgot: 'Hatırlamadım',
      reviewComplete: 'Tekrar Tamamlandı',
      
      // Calendar
      today: 'Bugün',
      thisMonth: 'Bu Ay',
      
      // Boxes
      daily: 'Günde Bir',
      every2Days: '2 Günde Bir',
      every4Days: '4 Günde Bir',
      weekly: 'Haftada Bir',
      every2Weeks: '2 Haftada Bir',
      learned: 'Kalıcı Olarak Öğrenildi',
      
      // Shared Brains
      shareNote: 'Not Paylaş',
      shareCode: 'Paylaşım Kodu',
      myShareCode: 'Paylaşım Kodum',
      enterShareCode: 'Paylaşım kodunu girin',
      selectNote: 'Not Seçin',
      receivedNotes: 'Gelen Notlar',
      sentNotes: 'Gönderilen Notlar',
      addToMyNotes: 'Notlarıma Ekle',
      shareSuccess: 'Not başarıyla paylaşıldı',
      noteAdded: 'Not notlarınıza eklendi',
      invalidCode: 'Geçersiz paylaşım kodu',
      cannotShareWithSelf: 'Kendi kendinize not paylaşamazsınız',
      from: 'Gönderen',
      to: 'Alıcı',
      sharedAt: 'Paylaşım Tarihi',
      noReceivedNotes: 'Henüz gelen not yok',
      noSentNotes: 'Henüz gönderilen not yok',
      
      // Premium
      advanced: 'Advanced',
      advancedUser: 'Advanced Kullanıcı',
      advancedPlan: 'Premium özelliklerle gelişmiş plan',
      basicPlan: 'Itera Basic',
      basicPlanDescription: 'Temel özelliklerle ücretsiz plan',
      
      // Additional UI texts
      welcome: 'Hoş geldin',
      leitnerBoxes: 'Leitner Kutuları',
      todayNotesWaiting: 'not seni bekliyor',
      note: 'not',
      notes: 'not',
      logoutConfirm: 'Çıkış yapmak istediğinizden emin misiniz?',
      logoutTitle: 'Çıkış Yap',
      cancelText: 'İptal',
      premiumFeatures: 'Advanced Paket Özellikleri:\n\n• Yüksek depolama alanı\n• Ortak akıl (Shared Brains)\n• Reklamsız deneyim',
      colorLegend: 'Renk Açıklamaları',
      completedDay: 'Tamamlanan Gün',
      change: 'Değiştir',
      upgrade: 'Yükselt',
      addPhoto: 'Fotoğraf Ekle',
      day: 'gün',
      days: 'gün',
      everyXDays: 'gün arayla',
      completed: 'Tamamlandı',
      lightTheme: 'Açık',
      darkTheme: 'Koyu',
      
      // Calendar months
      january: 'Ocak',
      february: 'Şubat',
      march: 'Mart',
      april: 'Nisan',
      may: 'Mayıs',
      june: 'Haziran',
      july: 'Temmuz',
      august: 'Ağustos',
      september: 'Eylül',
      october: 'Ekim',
      november: 'Kasım',
      december: 'Aralık',
      
      // Calendar days
      monday: 'Pzt',
      tuesday: 'Sal',
      wednesday: 'Çar',
      thursday: 'Per',
      friday: 'Cum',
      saturday: 'Cmt',
      sunday: 'Paz',
      
      // Box detail screen
      newNote: 'Yeni',
      dailyDescription: 'Her gün tekrar edilecek notlar',
      every2DaysDescription: '2 günde bir tekrar edilecek notlar',
      every4DaysDescription: '4 günde bir tekrar edilecek notlar',
      weeklyDescription: 'Haftada bir tekrar edilecek notlar',
      every2WeeksDescription: '2 haftada bir tekrar edilecek notlar',
      learnedDescription: 'Kalıcı olarak öğrenilmiş notlar',
      emptyBoxMessage: 'Bu kutuya ilk notunu eklemek için yukarıdaki "Yeni" butonuna tıkla!',
      
      // Note templates
      blankNote: 'Boş Not',
      cornellMethod: 'Cornell Metodu',
      qaCard: 'Soru - Cevap Kartı',
      meetingNote: 'Toplantı Notu',
      literatureReview: 'Literatür İncelemesi',
      templateSelect: 'Şablon Seçin',
      newNoteTitle: 'Yeni Not',
      enterNoteTitle: 'Lütfen not başlığı girin',
      error: 'Hata',
      chooseTemplate: 'Şablon Seçin',
      enterNoteTitlePlaceholder: 'Not başlığını girin...',
      richTextEditor: 'İçerik (Zengin Metin Editörü)',
      loadingNotes: 'Notlar yükleniyor...',
      noNotesYet: 'Henüz not yok',
      deleteNoteConfirm: 'Bu notu silmek istediğinizden emin misiniz?',
      deleteNoteTitle: 'Not Sil',
      noteDeletedSuccess: 'Not başarıyla silindi!',
      success: 'Başarılı',
      noteDeleteError: 'Not silinirken hata oluştu: ',
      noteAddedSuccess: 'Not başarıyla eklendi!',
      noteAddError: 'Not eklenirken hata oluştu: ',
      noteUpdatedSuccessfully: 'Not başarıyla güncellendi!',
      errorUpdatingNote: 'Not güncellenirken hata oluştu: ',
      changesNotSaved: 'Değişiklikler kaydedilmedi. Çıkmak istediğinizden emin misiniz?',
      areYouSureYouWantToExit: 'Çıkmak istediğinizden emin misiniz?',
      stay: 'Kalmaya Devam Et',
      exit: 'Çık',
      contentRichTextEditor: 'İçerik (Zengin Metin Editörü)',
      markdownHelp: 'Markdown Yardımı',
      markdownHelpText: '# Büyük Başlık\n## Orta Başlık\n**Kalın Metin**\n*İtalik Metin*\n- Liste öğesi\n> Alıntı\n`Kod`\n```\nKod Bloğu\n```',
    },
    en: {
      // Navigation
      home: 'Home',
      calendar: 'Calendar',
      profile: 'Profile',
      sharedBrains: 'Shared Brains',
      
      // Common
      loading: 'Loading...',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      back: 'Back',
      backButton: '← Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      
      // Auth
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      
      // Home
      reviewStart: 'Start Review',
      reviewComplete: 'Great Job! That\'s all for today.',
      addNote: 'Add Note',
      
      // Profile
      userInfo: 'User Information',
      changePassword: 'Change Password',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      plan: 'Plan',
      changePhoto: 'Change Photo',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      
      // Notes
      notes: 'Notes',
      noteTitle: 'Note Title',
      noteContent: 'Note Content',
      createNote: 'Create Note',
      editNote: 'Edit Note',
      deleteNote: 'Delete Note',
      
      // Review
      review: 'Review',
      remembered: 'Remembered',
      forgot: 'Forgot',
      reviewComplete: 'Review Complete',
      
      // Calendar
      today: 'Today',
      thisMonth: 'This Month',
      
      // Boxes
      daily: 'Daily',
      every2Days: 'Every 2 Days',
      every4Days: 'Every 4 Days',
      weekly: 'Weekly',
      every2Weeks: 'Every 2 Weeks',
      learned: 'Permanently Learned',
      
      // Shared Brains
      shareNote: 'Share Note',
      shareCode: 'Share Code',
      myShareCode: 'My Share Code',
      enterShareCode: 'Enter share code',
      selectNote: 'Select Note',
      receivedNotes: 'Received Notes',
      sentNotes: 'Sent Notes',
      addToMyNotes: 'Add to My Notes',
      shareSuccess: 'Note shared successfully',
      noteAdded: 'Note added to your notes',
      invalidCode: 'Invalid share code',
      cannotShareWithSelf: 'Cannot share note with yourself',
      from: 'From',
      to: 'To',
      sharedAt: 'Shared At',
      noReceivedNotes: 'No received notes yet',
      noSentNotes: 'No sent notes yet',
      
      // Premium
      advanced: 'Advanced',
      advancedUser: 'Advanced User',
      advancedPlan: 'Advanced plan with premium features',
      basicPlan: 'Itera Basic',
      basicPlanDescription: 'Free plan with basic features',
      
      // Additional UI texts
      welcome: 'Welcome',
      leitnerBoxes: 'Leitner Boxes',
      todayNotesWaiting: 'notes are waiting for you',
      note: 'note',
      notes: 'notes',
      logoutConfirm: 'Are you sure you want to logout?',
      logoutTitle: 'Logout',
      cancelText: 'Cancel',
      premiumFeatures: 'Advanced Package Features:\n\n• High storage capacity\n• Shared Brains\n• Ad-free experience',
      colorLegend: 'Color Legend',
      completedDay: 'Completed Day',
      change: 'Change',
      upgrade: 'Upgrade',
      addPhoto: 'Add Photo',
      day: 'day',
      days: 'days',
      everyXDays: 'days',
      completed: 'Completed',
      lightTheme: 'Light',
      darkTheme: 'Dark',
      
      // Calendar months
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
      
      // Calendar days
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
      
      // Box detail screen
      newNote: 'New',
      dailyDescription: 'Notes to be reviewed daily',
      every2DaysDescription: 'Notes to be reviewed every 2 days',
      every4DaysDescription: 'Notes to be reviewed every 4 days',
      weeklyDescription: 'Notes to be reviewed weekly',
      every2WeeksDescription: 'Notes to be reviewed every 2 weeks',
      learnedDescription: 'Permanently learned notes',
      emptyBoxMessage: 'Click the "New" button above to add your first note to this box!',
      
      // Note templates
      blankNote: 'Blank Note',
      cornellMethod: 'Cornell Method',
      qaCard: 'Q&A Card',
      meetingNote: 'Meeting Note',
      literatureReview: 'Literature Review',
      templateSelect: 'Select Template',
      newNoteTitle: 'New Note',
      enterNoteTitle: 'Please enter note title',
      error: 'Error',
      chooseTemplate: 'Choose Template',
      enterNoteTitlePlaceholder: 'Enter note title...',
      richTextEditor: 'Content (Rich Text Editor)',
      loadingNotes: 'Loading notes...',
      noNotesYet: 'No notes yet',
      deleteNoteConfirm: 'Are you sure you want to delete this note?',
      deleteNoteTitle: 'Delete Note',
      noteDeletedSuccess: 'Note deleted successfully!',
      success: 'Success',
      noteDeleteError: 'Error deleting note: ',
      noteAddedSuccess: 'Note added successfully!',
      noteAddError: 'Error adding note: ',
      noteUpdatedSuccessfully: 'Note updated successfully!',
      errorUpdatingNote: 'Error updating note: ',
      changesNotSaved: 'Changes were not saved. Are you sure you want to exit?',
      areYouSureYouWantToExit: 'Are you sure you want to exit?',
      stay: 'Stay',
      exit: 'Exit',
      contentRichTextEditor: 'Content (Rich Text Editor)',
      markdownHelp: 'Markdown Help',
      markdownHelpText: '# Large Header\n## Medium Header\n**Bold Text**\n*Italic Text*\n- List item\n> Quote\n`Code`\n```\nCode Block\n```',
    }
  };

  const currentColors = colors[theme] || colors.light;
  const currentTexts = texts[language] || texts.tr;

  // Global stil fonksiyonları
  const getThemedStyles = (styles) => {
    const isDark = theme === 'dark';
    return {
      ...styles,
      backgroundColor: isDark ? currentColors.background : styles.backgroundColor,
      color: isDark ? currentColors.text : styles.color,
    };
  };

  const value = {
    theme,
    language,
    colors: currentColors,
    texts: currentTexts,
    isDark: theme === 'dark',
    getText: (key) => currentTexts[key] || key,
    getThemedStyles,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 