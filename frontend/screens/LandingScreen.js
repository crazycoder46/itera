import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Image, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const { colors, language, setLanguage } = useTheme();
  const { updateLanguage } = useAuth();
  
  // Animation refs
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;
  const featureAnim1 = useRef(new Animated.Value(0)).current;
  const featureAnim2 = useRef(new Animated.Value(0)).current;
  const featureAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim5 = useRef(new Animated.Value(0)).current;
  const fadeAnim6 = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Counter animations
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);
  const [counter3, setCounter3] = useState(0);
  const [hasAnimated, setHasAnimated] = useState({
    section2: false,
    section3: false,
    section4: false,
    feature1: false,
    feature2: false,
    feature3: false,
    section5: false,
    section6: false,
    counters: false
  });

  useEffect(() => {
    // Initial hero animation only
    Animated.parallel([
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);
  
  const animateCounter = (setter, targetValue, duration) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * targetValue);
      setter(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // Trigger animations based on scroll position - adjusted for better timing
    if (scrollY > 400 && !hasAnimated.section2) {
      setHasAnimated(prev => ({ ...prev, section2: true }));
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
    
    if (scrollY > 800 && !hasAnimated.section3) {
      setHasAnimated(prev => ({ ...prev, section3: true }));
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
    
    if (scrollY > 1200 && !hasAnimated.section4) {
      setHasAnimated(prev => ({ ...prev, section4: true }));
      Animated.timing(fadeAnim4, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
    
    // Rich Editor (Feature 1) animation
    if (scrollY > 1100 && !hasAnimated.feature1) {
      setHasAnimated(prev => ({ ...prev, feature1: true }));
      Animated.timing(featureAnim1, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
    
    // Leitner System (Feature 2) animation
    if (scrollY > 1400 && !hasAnimated.feature2) {
      setHasAnimated(prev => ({ ...prev, feature2: true }));
      Animated.timing(featureAnim2, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
    
    // Smart Calendar (Feature 3) animation
    if (scrollY > 1700 && !hasAnimated.feature3) {
      setHasAnimated(prev => ({ ...prev, feature3: true }));
      Animated.timing(featureAnim3, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
    
    if (scrollY > 2200 && !hasAnimated.section5) {
      setHasAnimated(prev => ({ ...prev, section5: true }));
      Animated.timing(fadeAnim5, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
    
    if (scrollY > 2400 && !hasAnimated.counters) {
      setHasAnimated(prev => ({ ...prev, counters: true }));
      // Start counter animations
      setTimeout(() => animateCounter(setCounter1, 70, 2000), 200);
      setTimeout(() => animateCounter(setCounter2, 70, 2200), 400);
      setTimeout(() => animateCounter(setCounter3, 300, 2500), 600);
    }
    
    if (scrollY > 2800 && !hasAnimated.section6) {
      setHasAnimated(prev => ({ ...prev, section6: true }));
      Animated.timing(fadeAnim6, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'tr' : 'en';
    await updateLanguage(newLanguage);
    
    // Update SEO meta tags based on language
    if (typeof document !== 'undefined') {
      const titles = {
        tr: 'Itera - Bilimsel Öğrenme Uygulaması | Leitner Sistemi ile Kalıcı Öğrenme',
        en: 'Itera - Scientific Learning App | Permanent Learning with Leitner System'
      };
      
      const descriptions = {
        tr: 'Itera, bilimsel Leitner Metodu ile öğrenme potansiyelinizi ortaya çıkarır. Spaced repetition tekniği ile bilgiyi kalıcı hale getirin. Ücretsiz başlayın!',
        en: 'Itera unleashes your learning potential with the scientifically proven Leitner Method. Make knowledge permanent with spaced repetition technique. Start for free!'
      };
      
      // Update document title
      document.title = titles[newLanguage];
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', descriptions[newLanguage]);
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', titles[newLanguage]);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', descriptions[newLanguage]);
      }
      
      // Update Twitter Card tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', titles[newLanguage]);
      }
      
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', descriptions[newLanguage]);
      }
      
      // Update lang attribute on html element
      const htmlElement = document.documentElement;
      if (htmlElement) {
        htmlElement.setAttribute('lang', newLanguage === 'tr' ? 'tr-TR' : 'en-US');
      }
    }
  };

  const scrollToHowItWorks = () => {
    // Simple scroll to features section
  };

  return (
    <View style={styles.container} accessibilityRole="main">
      {/* Transparent Navbar */}
      <View style={styles.navbar} accessibilityRole="navigation" accessibilityLabel="Ana navigasyon">
        <View style={styles.logoContainer}>
          <Image 
            source={require('../landing_images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Itera logosu"
            alt="Itera - Bilimsel Öğrenme Uygulaması Logosu"
          />
          <Text style={[styles.logoText, { color: colors.primary }]} accessibilityRole="header" accessibilityLevel={1}>Itera</Text>
        </View>
        
        <View style={styles.navRight}>
          <TouchableOpacity 
            style={[styles.navButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel={language === 'en' ? 'Sign In' : 'Giriş Yap'}
            accessibilityHint={language === 'en' ? 'Navigate to login page' : 'Giriş sayfasına git'}
          >
            <Text style={[styles.navButtonText, { color: colors.primary }]}>
              {language === 'en' ? 'Sign In' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonFilled, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="button"
            accessibilityLabel={language === 'en' ? 'Sign Up' : 'Kayıt Ol'}
            accessibilityHint={language === 'en' ? 'Navigate to registration page' : 'Kayıt sayfasına git'}
          >
            <Text style={[styles.navButtonText, { color: '#ffffff' }]}>
              {language === 'en' ? 'Sign Up' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.langButton, { borderColor: colors.primary }]}
            onPress={toggleLanguage}
            accessibilityRole="button"
            accessibilityLabel={language === 'en' ? 'Switch to Turkish' : 'Switch to English'}
            accessibilityHint={language === 'en' ? 'Change language to Turkish' : 'Dili İngilizce olarak değiştir'}
          >
            <Text style={[styles.langText, { color: colors.primary }]}>
              {language === 'en' ? 'TR' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessibilityRole="scrollbar"
      >
        
        {/* BÖLÜM 1: ANA GİRİŞ (HERO BÖLÜMÜ) */}
        <Animated.View 
          style={[
            styles.heroSection, 
            { backgroundColor: colors.background },
            {
              opacity: fadeAnim1,
              transform: [{ translateY: slideAnim }]
            }
          ]}
          accessibilityRole="banner"
        >
          <View style={styles.heroContainer}>
            <Animated.View 
              style={[
                styles.heroTextContainer,
                {
                  transform: width > 768 ? [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [-30, 0]
                    })
                  }, {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [30, 0]
                    })
                  }] : [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [30, 0]
                    })
                  }]
                }
              ]}
            >
              <Text 
                style={[styles.heroTitle, { color: colors.text }]}
                accessibilityRole="header"
                accessibilityLevel={1}
                accessibilityLabel={language === 'en' ? 'Main heading: Don\'t Memorize Knowledge, Learn It.' : 'Ana başlık: Bilgiyi Ezberlemeyin, Öğrenin.'}
              >
                {language === 'en' ? 'Don\'t Memorize Knowledge, Learn It.' : 'Bilgiyi Ezberlemeyin, Öğrenin.'}
              </Text>
              <Text 
                style={[styles.heroSubtitle, { color: colors.textSecondary }]}
                accessibilityRole="text"
                accessibilityLabel={language === 'en' ? 'Subtitle describing Itera\'s learning method' : 'Itera\'nın öğrenme yöntemini açıklayan alt başlık'}
              >
                {language === 'en' 
                  ? 'Itera unleashes your learning potential with the scientifically proven Leitner Method. It predicts what you\'ll forget before you do and reminds you at the perfect moment to make knowledge permanent.¹'
                  : 'Itera, bilimsel olarak kanıtlanmış Leitner Metodu yöntemiyle öğrenme potansiyelinizi ortaya çıkarır. Neyi ne zaman unutacağınızı sizden önce tahmin eder ve tam zamanında hatırlatarak bilgiyi kalıcı hale getirir.¹'
                }
              </Text>
              
              <Animated.View
                style={{
                  transform: [{
                    scale: fadeAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1]
                    })
                  }]
                }}
              >
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('Register')}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={language === 'en' ? 'Start Learning for Free' : 'Ücretsiz Öğrenmeye Başla'}
                  accessibilityHint={language === 'en' ? 'Navigate to registration to start using Itera' : 'Itera\'yı kullanmaya başlamak için kayıt sayfasına git'}
                >
                  <Text style={[styles.primaryButtonText, { color: '#ffffff' }]}>
                    {language === 'en' ? 'Start Learning for Free' : 'Ücretsiz Öğrenmeye Başla'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity 
                style={styles.secondaryLink}
                onPress={scrollToHowItWorks}
                accessibilityRole="button"
                accessibilityLabel={language === 'en' ? 'How Does It Work?' : 'Nasıl Çalışır?'}
                accessibilityHint={language === 'en' ? 'Scroll to learn how Itera works' : 'Itera\'nın nasıl çalıştığını öğrenmek için aşağı kaydır'}
              >
                <Text style={[styles.secondaryLinkText, { color: colors.primary }]}>
                  {language === 'en' ? 'How Does It Work? ↓' : 'Nasıl Çalışır? ↓'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={[
                styles.heroImageContainer,
                {
                  opacity: fadeAnim1,
                  transform: width > 768 ? [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [30, 0]
                    })
                  }, {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [30, 0]
                    })
                  }] : [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [30, 0]
                    })
                  }]
                }
              ]}
            >
              <Image 
                source={require('../landing_images/main.png')} 
                style={styles.heroImage}
                resizeMode="contain"
                accessibilityLabel={language === 'en' ? 'Itera app interface showing the main dashboard with Leitner boxes' : 'Leitner kutuları ile ana panoyu gösteren Itera uygulama arayüzü'}
                alt={language === 'en' ? 'Itera Learning App Main Interface' : 'Itera Öğrenme Uygulaması Ana Arayüzü'}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* BÖLÜM 2: SORUNUN TANIMI */}
        <Animated.View 
          style={[
            styles.section, 
            { backgroundColor: colors.surface, opacity: fadeAnim2 }
          ]}
          accessibilityRole="region"
          accessibilityLabel={language === 'en' ? 'Problem identification section' : 'Sorun tanımlama bölümü'}
        >
          <View style={styles.sectionContainer}>
            <Animated.View 
              style={[
                styles.sectionImageContainer,
                {
                  transform: [{
                    translateX: fadeAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0]
                    })
                  }, {
                    translateY: fadeAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Image 
                source={require('../landing_images/yigin.png')} 
                style={styles.sectionImage}
                resizeMode="contain"
                accessibilityLabel={language === 'en' ? 'Illustration showing pile of study notes representing the problem of disorganized learning' : 'Düzensiz öğrenme problemini temsil eden not yığını illüstrasyonu'}
                alt={language === 'en' ? 'Pile of Study Notes Problem' : 'Not Yığını Problemi'}
              />
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.sectionTextContainer,
                {
                  transform: [{
                    translateX: fadeAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }, {
                    translateY: fadeAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Text 
                style={[styles.sectionTitle, { color: colors.text }]}
                accessibilityRole="header"
                accessibilityLevel={2}
              >
                {language === 'en' ? 'Are Your Study Notes Turning Into a Pile?' : 'Çalıştığınız Notlar Bir Yığına mı Dönüşüyor?'}
              </Text>
              <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                {language === 'en'
                  ? 'Are you getting lost among your notes, forgetting the most critical information despite constant review? You\'re not alone. Traditional methods fall short in managing accumulated notes over time and making knowledge permanent.'
                  : 'Notlarınız arasında kayboluyor, sürekli tekrar etmenize rağmen en kritik bilgileri mi unutuyorsunuz? Yalnız değilsiniz. Geleneksel yöntemler, zamanla biriken notları yönetmekte ve bilgiyi kalıcı kılmakta yetersiz kalır.'
                }
              </Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* BÖLÜM 3: ÇÖZÜMÜN SUNUMU */}
        <Animated.View 
          style={[
            styles.section, 
            { backgroundColor: colors.background, opacity: fadeAnim3 }
          ]}
          accessibilityRole="region"
          accessibilityLabel={language === 'en' ? 'Solution presentation section' : 'Çözüm sunumu bölümü'}
        >
          <View style={styles.sectionContainer}>
            <Animated.View 
              style={[
                styles.sectionTextContainer,
                {
                  transform: [{
                    translateX: fadeAnim3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0]
                    })
                  }, {
                    translateY: fadeAnim3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Text 
                style={[styles.sectionTitle, { color: colors.text }]}
                accessibilityRole="header"
                accessibilityLevel={2}
              >
                {language === 'en' ? 'End the Stress, Start Learning' : 'Stresi Bitirin, Öğrenmeye Başlayın'}
              </Text>
              <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                {language === 'en'
                  ? 'Itera is designed to break this inefficient cycle. Instead of a study routine based on guesswork and chance, it offers you a scientific and automatic system. Itera adapts to your personal learning pace, identifies your weak points, and puts your learning process on complete autopilot. All that\'s left for you is to enjoy learning.'
                  : 'Itera, bu verimsiz döngüyü kırmak için tasarlandı. Tahminlere ve şansa dayalı bir çalışma düzeni yerine, size bilimsel ve otomatik bir sistem sunar. Itera, sizin kişisel öğrenme hızınıza adapte olur, zayıf noktalarınızı tespit eder ve öğrenme sürecinizi tamamen otomatik pilota alır. Size sadece öğrenmenin keyfini çıkarmak kalır.'
                }
              </Text>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.sectionImageContainer,
                {
                  transform: [{
                    translateX: fadeAnim3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }, {
                    translateY: fadeAnim3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Image 
                source={require('../landing_images/ogrenme.png')} 
                style={styles.sectionImage}
                resizeMode="contain"
                accessibilityLabel={language === 'en' ? 'Illustration showing organized and efficient learning process with Itera' : 'Itera ile düzenli ve verimli öğrenme sürecini gösteren illüstrasyon'}
                alt={language === 'en' ? 'Efficient Learning Process' : 'Verimli Öğrenme Süreci'}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* BÖLÜM 4: SİSTEM NASIL ÇALIŞIR? */}
        <Animated.View 
          style={[
            styles.section, 
            { backgroundColor: colors.background, opacity: fadeAnim4 }
          ]}
          accessibilityRole="region"
          accessibilityLabel={language === 'en' ? 'How it works section' : 'Nasıl çalışır bölümü'}
        >
          <Text 
            style={[styles.sectionTitle, { color: colors.text, marginBottom: 40 }]}
            accessibilityRole="header"
            accessibilityLevel={2}
          >
            {language === 'en' ? 'Permanent Learning in Just a Few Steps' : 'Sadece Birkaç Adımda Kalıcı Öğrenme'}
          </Text>

          {/* Feature 1: Rich Editor */}
          <Animated.View 
            style={[
              styles.featureSection,
              {
                opacity: featureAnim1,
                transform: [{
                  translateY: featureAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0]
                  })
                }]
              }
            ]}
            accessibilityRole="region"
            accessibilityLabel={language === 'en' ? 'Rich Editor feature' : 'Zengin Editör özelliği'}
          >
            <View style={styles.featureContainer}>
              <Animated.View 
                style={[
                  styles.featureImageContainer,
                  {
                    transform: [{
                      translateY: featureAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Image 
                  source={require('../landing_images/editor.png')} 
                  style={styles.featureImage}
                  resizeMode="contain"
                  accessibilityLabel={language === 'en' ? 'Rich text editor interface with Markdown support and image insertion capabilities' : 'Markdown desteği ve resim ekleme özellikli zengin metin editörü arayüzü'}
                  alt={language === 'en' ? 'Rich Text Editor Interface' : 'Zengin Metin Editörü Arayüzü'}
                />
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.featureTextContainer,
                  {
                    transform: [{
                      translateY: featureAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Text 
                  style={[styles.featureTitle, { color: colors.text }]}
                  accessibilityRole="header"
                  accessibilityLevel={3}
                >
                  {language === 'en' ? 'Rich Editor: The Smartest Way to Take Notes' : 'Zengin Editör: Not Almanın En Akıllı Yolu'}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {language === 'en'
                    ? 'Don\'t limit your ideas. Format your notes instantly with full Markdown support, create headings and lists. Add images from your device to turn your notes into a visual feast.'
                    : 'Fikirlerinizi sınırlamayın. Tam Markdown desteği ile notlarınızı anında biçimlendirin, başlıklar ve listeler oluşturun. Cihazınızdan resimler ekleyerek notlarınızı görsel bir şölene dönüştürün.'
                  }
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Feature 2: Leitner System */}
          <Animated.View 
            style={[
              styles.featureSection,
              {
                opacity: featureAnim2,
                transform: [{
                  translateY: featureAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0]
                  })
                }]
              }
            ]}
            accessibilityRole="region"
            accessibilityLabel={language === 'en' ? 'Leitner System feature' : 'Leitner Sistemi özelliği'}
          >
            <View style={styles.featureContainer}>
              <Animated.View 
                style={[
                  styles.featureTextContainer,
                  {
                    transform: [{
                      translateY: featureAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Text 
                  style={[styles.featureTitle, { color: colors.text }]}
                  accessibilityRole="header"
                  accessibilityLevel={3}
                >
                  {language === 'en' ? 'Leitner System: Your Learning Flow Perfected' : 'Leitner Sistemi: Öğrenme Akışınız Mükemmelleşiyor'}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {language === 'en'
                    ? 'Itera is an intelligent guide that tells you what to study when. Flashcard piles and planning stress are now a thing of the past. The process is simple and automatic:\n\n• Entry: When you create a new note, it\'s automatically added to "Box 1" (daily review).\n• Review and Advancement: When review time comes, Itera shows you the note. If you remember correctly, the note moves to the next box—progressively longer intervals like \'Every 2 Days\' or \'Every 4 Days\'.\n• Reinforcement: If you can\'t remember, the note stays in the same box. This shows the knowledge is weak, and Itera prioritizes that topic until you truly learn it.\n• Graduation: When a note successfully completes the final box ("Permanently Learned"), it has settled into your permanent memory and "graduates" from the system.'
                    : 'Itera, size neyi ne zaman çalışacağınızı söyleyen akıllı bir rehberdir. Flashcard yığınları ve plansızlık stresi artık geçmişte kaldı. Süreç basit ve otomatiktir:\n\n• Giriş: Yeni bir not oluşturduğunuzda, "1. Kutu"ya (günlük tekrar) otomatik olarak eklenir.\n• Tekrar ve Yükselme: Tekrar zamanı geldiğinde Itera size notu gösterir. Doğru hatırlarsanız, not bir sonraki kutuya—örneğin \'2 Günde Bir\' veya \'4 Günde Bir\' gibi giderek uzayan aralıklara—yükselir.\n• Pekiştirme: Eğer hatırlayamazsanız, not aynı kutuda kalır. Bu, bilginin zayıf olduğunu gösterir ve Itera, siz onu gerçekten öğrenene kadar o konuyu önceliklendirir.\n• Mezuniyet: Bir not en son kutuyu da başarıyla tamamladığında ("Kalıcı Olarak Öğrenildi"), kalıcı hafızanıza yerleşmiş demektir ve sistemden "mezun olur".'
                  }
                </Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.featureImageContainer,
                  {
                    transform: [{
                      translateY: featureAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Image 
                  source={language === 'en' 
                    ? require('../landing_images/leitner_english.png')
                    : require('../landing_images/leitner_turkish.png')
                  } 
                  style={styles.featureImage}
                  resizeMode="contain"
                  accessibilityLabel={language === 'en' ? 'Leitner System flashcard pile illustration' : 'Leitner Sistemi flashcard yığını illüstrasyonu'}
                  alt={language === 'en' ? 'Leitner System Flashcard Pile' : 'Leitner Sistemi Flashcard Yığını'}
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Feature 3: Smart Calendar */}
          <Animated.View 
            style={[
              styles.featureSection,
              {
                opacity: featureAnim3,
                transform: [{
                  translateY: featureAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0]
                  })
                }]
              }
            ]}
            accessibilityRole="region"
            accessibilityLabel={language === 'en' ? 'Smart Calendar feature' : 'Akıllı Takvim özelliği'}
          >
            <View style={styles.featureContainer}>
              <Animated.View 
                style={[
                  styles.featureImageContainer,
                  {
                    transform: [{
                      translateY: featureAnim3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Image 
                  source={require('../landing_images/takvim.png')} 
                  style={styles.featureImage}
                  resizeMode="contain"
                  accessibilityLabel={language === 'en' ? 'Smart calendar interface showing color-coded learning schedule' : 'Renk kodlu öğrenme planını gösteren akıllı takvim arayüzü'}
                  alt={language === 'en' ? 'Smart Calendar Interface' : 'Akıllı Takvim Arayüzü'}
                />
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.featureTextContainer,
                  {
                    transform: [{
                      translateY: featureAnim3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Text 
                  style={[styles.featureTitle, { color: colors.text }]}
                  accessibilityRole="header"
                  accessibilityLevel={3}
                >
                  {language === 'en' ? 'Smart Calendar: Your Learning Plan Under Control' : 'Akıllı Takvim: Öğrenme Planınız Kontrol Altında'}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {language === 'en'
                    ? 'See clearly in your calendar with color-coded patterns which topics you\'ll review on which days over the coming weeks. No more surprises and last-minute stress. With Itera, you\'re always ready for the next step.'
                    : 'Önümüzdeki haftalar boyunca hangi gün hangi konuları tekrar edeceğinizi renk kodlu desenlerle takviminizde net bir şekilde görün. Sürprizlere ve son dakika stresine son. Itera ile her zaman bir sonraki adıma hazırsınız.'
                  }
                </Text>
              </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* BÖLÜM 5: NEDEN ITERA? */}
        <Animated.View 
          style={[
            styles.section, 
            { backgroundColor: colors.background, opacity: fadeAnim5 }
          ]}
          accessibilityRole="region"
          accessibilityLabel={language === 'en' ? 'Why Itera section' : 'Neden Itera? bölümü'}
        >
          <Text 
            style={[styles.sectionTitle, { color: colors.text }]}
            accessibilityRole="header"
            accessibilityLevel={2}
          >
            {language === 'en' ? 'Efficiency Based on Scientific Foundations' : 'Bilimsel Temellere Dayanan Verimlilik'}
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {language === 'en'
              ? 'Itera\'s effectiveness is based on decades of cognitive science research. It has been proven that 50% to 80% of information learned through traditional "cramming" methods is forgotten within a few days. Itera solves this problem at its root.'
              : 'Itera\'nın etkinliği, onlarca yıllık bilişsel bilim araştırmalarına dayanır. Geleneksel "yığınlama" (cramming) yöntemleriyle öğrenilen bilginin birkaç gün içinde %50 ila %80\'inin unutulduğu kanıtlanmıştır. Itera ise bu problemi kökünden çözer.'
            }
          </Text>

          <Animated.View 
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim5,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 25]
                  })
                }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.statItem,
                {
                  transform: [{
                    scale: fadeAnim5.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    })
                  }]
                }
              ]}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{counter1}%</Text>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'Time Savings' : 'Zaman Tasarrufu'}
              </Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.statItem,
                {
                  transform: [{
                    scale: fadeAnim5.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    })
                  }]
                }
              ]}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{counter2}%</Text>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'Exam Success Rate' : 'Sınav Başarısı'}
              </Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.statItem,
                {
                  transform: [{
                    scale: fadeAnim5.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    })
                  }]
                }
              ]}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{counter3}%</Text>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'Retention Increase' : 'Hafızada Tutma Artışı'}
              </Text>
            </Animated.View>
          </Animated.View>

          <Text style={[styles.scientificText, { color: colors.textSecondary }]}>
            {language === 'en'
              ? 'Scientific Foundation: Our platform is based on Hermann Ebbinghaus\'s pioneering work on the "Forgetting Curve" in the 19th century. Ebbinghaus mathematically demonstrated how quickly information is erased from our memory when we don\'t review it. The Leitner System and Spaced Repetition used by Itera are the most effective methods designed to break this forgetting curve.'
              : 'Bilimsel Dayanak: Platformumuzun temeli, 19. yüzyılda Hermann Ebbinghaus\'un "Unutma Eğrisi" üzerine yaptığı öncü çalışmalara dayanır. Ebbinghaus, bilgiyi tekrar etmediğimizde hafızamızdan ne kadar hızlı silindiğini matematiksel olarak göstermiştir. Itera\'nın kullandığı Leitner Sistemi ve Aralıklı Tekrar, bu unutma eğrisini kırmak için tasarlanmış en etkili yöntemlerdir.'
            }
          </Text>
        </Animated.View>

        {/* BÖLÜM 6: SON EYLEME ÇAĞRI */}
        <Animated.View 
          style={[
            styles.ctaSection, 
            { backgroundColor: colors.surface, opacity: fadeAnim6 }
          ]}
          accessibilityRole="region"
          accessibilityLabel={language === 'en' ? 'Call to action section' : 'Son eylem çağrısı bölümü'}
        >
          <View style={styles.ctaContainer}>
            <Animated.View 
              style={[
                styles.ctaTextContainer,
                {
                  transform: [{
                    translateX: fadeAnim6.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0]
                    })
                  }, {
                    translateY: fadeAnim6.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Text 
                style={[styles.ctaTitle, { color: colors.text }]}
                accessibilityRole="header"
                accessibilityLevel={2}
              >
                {language === 'en' ? 'Ready to Fundamentally Change Your Learning Style?' : 'Öğrenme Şeklinizi Kökünden Değiştirmeye Hazır mısınız?'}
              </Text>
              <Text style={[styles.ctaSubtitle, { color: colors.textSecondary }]}>
                {language === 'en'
                  ? 'Join thousands of students who have revolutionized their study habits.'
                  : 'Çalışma alışkanlıklarında devrim yaratan binlerce öğrenciye katılın.'
                }
              </Text>

              <TouchableOpacity 
                style={[styles.ctaButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Register')}
                accessibilityRole="button"
                accessibilityLabel={language === 'en' ? 'Start your learning journey' : 'Öğrenme yolculuğunuza başla'}
                accessibilityHint={language === 'en' ? 'Navigate to registration to start using Itera' : 'Itera\'yı kullanmaya başlamak için kayıt sayfasına git'}
              >
                <Text style={[styles.ctaButtonText, { color: '#ffffff' }]}>
                  {language === 'en' ? 'Start Your Learning Journey' : 'Öğrenme Yolculuğunuza Başlayın'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor: colors.primary, marginTop: 12 }]}
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel={language === 'en' ? 'Already a member?' : 'Zaten Üye misiniz?'}
                accessibilityHint={language === 'en' ? 'Navigate to login page' : 'Giriş sayfasına git'}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  {language === 'en' ? 'Already a Member?' : 'Zaten Üye misiniz?'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={[
                styles.ctaImageContainer,
                {
                  opacity: fadeAnim6,
                  transform: [{
                    translateX: fadeAnim6.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }, {
                    translateY: fadeAnim6.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Image 
                source={require('../landing_images/gemi.png')} 
                style={styles.ctaImage}
                resizeMode="contain"
                accessibilityLabel={language === 'en' ? 'Ship illustration representing the journey of learning' : 'Öğrenme yolculuğunu temsil eden gemi illüstrasyonu'}
                alt={language === 'en' ? 'Ship Illustration' : 'Gemi Illüstrasyonu'}
              />
            </Animated.View>
          </View>
        </Animated.View>



        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('FAQ')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {language === 'en' ? 'FAQ' : 'SSS'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {language === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {language === 'en' ? 'Terms of Service' : 'Kullanım Şartları'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => window.open('mailto:itera.app@mail.com', '_blank')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {language === 'en' ? 'Contact Us' : 'İletişim'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2024 Itera. {language === 'en' ? 'Empowering learners worldwide.' : 'Dünya çapında öğrencileri güçlendiriyor.'}
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary, marginTop: 8 }]}>
            {language === 'en' ? 'Contact:' : 'İletişim:'} itera.app@mail.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Responsive styles function
const createResponsiveStyles = () => {
  const isWeb = width > 768;
  
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    navbar: {
      position: isWeb ? 'absolute' : 'sticky',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isWeb ? 24 : 16,
      paddingTop: isWeb ? 35 : 20,
      paddingBottom: isWeb ? 16 : 12,
      zIndex: 1000,
      backgroundColor: isWeb ? 'transparent' : 'rgba(254,253,251,0.95)',
      backdropFilter: isWeb ? 'none' : 'blur(10px)',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 0,
    },
    logoImage: {
      width: isWeb ? 64 : 40,
      height: isWeb ? 64 : 40,
      marginRight: isWeb ? 12 : 8,
    },
    logoText: {
      fontSize: isWeb ? 28 : 20,
      fontWeight: 'bold',
    },
    navRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isWeb ? 12 : 8,
      flexShrink: 0,
    },
    navButton: {
      paddingHorizontal: isWeb ? 16 : 12,
      paddingVertical: isWeb ? 8 : 6,
      borderWidth: 1,
      borderRadius: 8,
    },
    navButtonFilled: {
      borderWidth: 0,
    },
    navButtonText: {
      fontSize: isWeb ? 14 : 12,
      fontWeight: '600',
    },
    langButton: {
      paddingHorizontal: isWeb ? 12 : 10,
      paddingVertical: isWeb ? 6 : 4,
      borderRadius: 16,
      borderWidth: 2,
      minWidth: isWeb ? 'auto' : 36,
    },
    langText: {
      fontSize: isWeb ? 14 : 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  scrollContainer: {
    flex: 1,
  },
    heroSection: {
      paddingTop: isWeb ? 60 : 20,
      paddingBottom: isWeb ? 80 : 40,
      paddingHorizontal: isWeb ? 32 : 16,
      alignItems: 'center',
      minHeight: isWeb ? 600 : 500,
      justifyContent: 'center',
    },
    heroContainer: {
      flexDirection: isWeb ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: isWeb ? 'space-between' : 'center',
      width: '100%',
      maxWidth: 1200,
    },
    heroTextContainer: {
      flex: 1,
      alignItems: isWeb ? 'flex-start' : 'center',
      paddingRight: isWeb ? 40 : 0,
      marginBottom: isWeb ? 0 : 20,
      width: '100%',
      justifyContent: 'center',
    },
    heroImageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    heroImage: {
      width: isWeb ? 800 : Math.min(width * 0.8, 320),
      height: isWeb ? 800 : Math.min(width * 0.8, 320),
    },
    heroTitle: {
      fontSize: isWeb ? 42 : 24,
      fontWeight: 'bold',
      marginBottom: isWeb ? 24 : 16,
      textAlign: isWeb ? 'left' : 'center',
      lineHeight: isWeb ? 50 : 30,
      maxWidth: 600,
    },
    heroSubtitle: {
      fontSize: isWeb ? 18 : 16,
      textAlign: isWeb ? 'left' : 'center',
      lineHeight: isWeb ? 28 : 24,
      marginBottom: isWeb ? 40 : 24,
      maxWidth: 700,
    },
    primaryButton: {
      paddingVertical: isWeb ? 20 : 16,
      paddingHorizontal: isWeb ? 48 : 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: isWeb ? 'flex-start' : 'center',
      boxShadow: '0 6px 25px rgba(0,0,0,0.25)',
      marginBottom: isWeb ? 24 : 16,
      minWidth: isWeb ? 320 : 280,
      transform: [{ scale: 1 }],
    },
    primaryButtonText: {
      fontSize: isWeb ? 18 : 16,
      fontWeight: 'bold',
    },
  secondaryLink: {
    paddingVertical: 8,
    alignSelf: isWeb ? 'flex-start' : 'center',
  },
  secondaryLinkText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: isWeb ? 'left' : 'center',
  },
    section: {
      paddingVertical: isWeb ? 30 : 20,
      paddingHorizontal: isWeb ? 32 : 16,
      alignItems: 'center',
    },
    sectionContainer: {
      flexDirection: isWeb ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 1200,
    },
    sectionTextContainer: {
      flex: 1,
      alignItems: isWeb ? 'flex-start' : 'center',
      paddingHorizontal: isWeb ? 20 : 0,
      marginBottom: isWeb ? 0 : 30,
    },
    sectionImageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isWeb ? 0 : 30,
    },
    sectionImage: {
      width: isWeb ? 550 : 320,
      height: isWeb ? 550 : 320,
    },
    sectionTitle: {
      fontSize: isWeb ? 32 : 22,
      fontWeight: 'bold',
      textAlign: isWeb ? 'left' : 'center',
      marginBottom: 24,
      lineHeight: isWeb ? 40 : 28,
      maxWidth: 600,
      paddingHorizontal: isWeb ? 0 : 16,
    },
    sectionText: {
      fontSize: isWeb ? 18 : 16,
      textAlign: isWeb ? 'left' : 'center',
      lineHeight: isWeb ? 28 : 24,
      maxWidth: 700,
    },
  featureSection: {
    width: '100%',
    maxWidth: 1200,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
    featureContainer: {
      flexDirection: isWeb ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    featureTextContainer: {
      flex: 1,
      alignItems: isWeb ? 'flex-start' : 'center',
      paddingHorizontal: isWeb ? 20 : 0,
      marginBottom: isWeb ? 0 : 20,
    },
    featureImageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isWeb ? 0 : 20,
    },
    featureImage: {
      width: isWeb ? 500 : 300,
      height: isWeb ? 500 : 300,
    },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
    featureTitle: {
      fontSize: isWeb ? 24 : 20,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: isWeb ? 'left' : 'center',
      lineHeight: isWeb ? 32 : 26,
    },
    featureDescription: {
      fontSize: isWeb ? 16 : 14,
      textAlign: isWeb ? 'left' : 'center',
      lineHeight: isWeb ? 24 : 20,
    },
      statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      maxWidth: isWeb ? 600 : 350,
      marginVertical: 32,
      paddingHorizontal: isWeb ? 0 : 16,
    },
    statItem: {
      alignItems: 'center',
      padding: isWeb ? 16 : 8,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.05)',
      minWidth: isWeb ? 120 : 80,
      flex: isWeb ? 0 : 1,
      marginHorizontal: isWeb ? 0 : 4,
    },
      statNumber: {
      fontSize: isWeb ? 42 : 28,
      fontWeight: '800',
      marginBottom: isWeb ? 8 : 4,
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statText: {
      fontSize: isWeb ? 15 : 12,
      textAlign: 'center',
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  scientificText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 700,
    marginTop: 24,
    fontStyle: 'italic',
  },
  ctaSection: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
    ctaContainer: {
      flexDirection: isWeb ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 1200,
    },
    ctaTextContainer: {
      flex: 1,
      alignItems: isWeb ? 'flex-start' : 'center',
      paddingRight: isWeb ? 40 : 0,
      marginBottom: isWeb ? 0 : 30,
    },
    ctaImageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaImage: {
      width: isWeb ? 600 : 350,
      height: isWeb ? 600 : 350,
    },
    ctaTitle: {
      fontSize: isWeb ? 28 : 24,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: isWeb ? 'left' : 'center',
      marginBottom: 16,
      lineHeight: isWeb ? 36 : 30,
      maxWidth: 600,
    },
    ctaSubtitle: {
      fontSize: isWeb ? 16 : 14,
      color: '#ffffff',
      textAlign: isWeb ? 'left' : 'center',
      marginBottom: 32,
      lineHeight: isWeb ? 24 : 20,
      opacity: 0.9,
      maxWidth: 500,
    },
  ctaButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0 6px 30px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: 350,
    transform: [{ scale: 1 }],
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

    footer: {
      padding: 20,
      alignItems: 'center',
    },
    footerLinks: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: 16,
      gap: 24,
    },
    footerLink: {
      fontSize: 14,
      textDecorationLine: 'underline',
      fontWeight: '500',
    },
    footerText: {
      fontSize: 14,
      textAlign: 'center',
    },
  });
};

const styles = createResponsiveStyles();