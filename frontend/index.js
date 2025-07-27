import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Google Analytics for Web
if (Platform.OS === 'web') {
  // Google Analytics gtag.js
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-6957MVS7HL';
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-6957MVS7HL');
  `;
  document.head.appendChild(script2);
}

// SEO Meta Tags and Structured Data for Web
if (Platform.OS === 'web') {
  // Set document title
  document.title = 'Itera - Bilimsel Öğrenme Uygulaması | Leitner Sistemi ile Kalıcı Öğrenme';
  
  // Create and append meta tags
  const createMetaTag = (name, content, property = false) => {
    const meta = document.createElement('meta');
    if (property) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  };

  // Basic SEO Meta Tags
  createMetaTag('description', 'Itera, bilimsel Leitner Metodu ile öğrenme potansiyelinizi ortaya çıkarır. Spaced repetition tekniği ile bilgiyi kalıcı hale getirin. Ücretsiz başlayın!');
  createMetaTag('keywords', 'spaced repetition, leitner sistemi, öğrenme uygulaması, not tekrar, bilimsel öğrenme, flashcard, study app, learning app, spaced learning, memory retention');
  createMetaTag('author', 'Itera Team');
  createMetaTag('robots', 'index, follow');
  createMetaTag('language', 'Turkish, English');
  createMetaTag('revisit-after', '7 days');
  
  // Viewport and mobile optimization
  createMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  createMetaTag('mobile-web-app-capable', 'yes');
  createMetaTag('apple-mobile-web-app-capable', 'yes');
  createMetaTag('apple-mobile-web-app-status-bar-style', 'default');
  createMetaTag('apple-mobile-web-app-title', 'Itera');
  
  // Open Graph Tags
  createMetaTag('og:title', 'Itera - Bilimsel Öğrenme Uygulaması | Leitner Sistemi', true);
  createMetaTag('og:description', 'Bilimsel Leitner Metodu ile öğrenme potansiyelinizi ortaya çıkarın. Spaced repetition tekniği ile bilgiyi kalıcı hale getirin. Ücretsiz başlayın!', true);
  createMetaTag('og:type', 'website', true);
  createMetaTag('og:url', typeof window !== 'undefined' ? window.location.href : 'https://iterapp.org', true);
  createMetaTag('og:site_name', 'Itera', true);
  createMetaTag('og:locale', 'tr_TR', true);
  createMetaTag('og:locale:alternate', 'en_US', true);
  
  // Twitter Card Tags
  createMetaTag('twitter:card', 'summary_large_image');
  createMetaTag('twitter:title', 'Itera - Bilimsel Öğrenme Uygulaması');
  createMetaTag('twitter:description', 'Leitner Metodu ile öğrenme potansiyelinizi ortaya çıkarın. Spaced repetition ile kalıcı öğrenme.');
  createMetaTag('twitter:site', '@IteraApp');
  createMetaTag('twitter:creator', '@IteraApp');
  
  // Canonical URL
  const canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  canonical.setAttribute('href', typeof window !== 'undefined' ? window.location.href : 'https://iterapp.org');
  document.head.appendChild(canonical);
  
  // Alternate language versions
  const createAlternateLink = (hreflang, href) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    document.head.appendChild(link);
  };
  
  createAlternateLink('tr', typeof window !== 'undefined' ? window.location.href + '?lang=tr' : 'https://iterapp.org?lang=tr');
  createAlternateLink('en', typeof window !== 'undefined' ? window.location.href + '?lang=en' : 'https://iterapp.org?lang=en');
  createAlternateLink('x-default', typeof window !== 'undefined' ? window.location.href : 'https://iterapp.org');
  
  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Itera",
    "alternateName": "Itera Learning App",
    "description": "Bilimsel Leitner Metodu ile öğrenme potansiyelinizi ortaya çıkarın. Spaced repetition tekniği ile bilgiyi kalıcı hale getirin.",
    "url": typeof window !== 'undefined' ? window.location.origin : 'https://iterapp.org',
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "author": {
      "@type": "Organization",
      "name": "Itera Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Itera",
      "logo": {
        "@type": "ImageObject",
        "url": typeof window !== 'undefined' ? window.location.origin + "/static/media/logo.png" : 'https://iterapp.org/static/media/logo.png'
      }
    },
    "inLanguage": ["tr", "en"],
    "keywords": ["spaced repetition", "leitner sistemi", "öğrenme uygulaması", "bilimsel öğrenme", "flashcard", "study app"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250"
    },
    "featureList": [
      "Leitner Sistemi ile Spaced Repetition",
      "Markdown Destekli Rich Editor",
      "Akıllı Takvim Sistemi",
      "Çoklu Dil Desteği (TR/EN)",
      "Dark/Light Tema",
      "Cloud Storage",
      "Shared Brains (Premium)"
    ],
    "screenshot": typeof window !== 'undefined' ? window.location.origin + "/static/media/screenshot.png" : 'https://iterapp.org/static/media/screenshot.png',
    "softwareVersion": "1.0.0",
    "datePublished": "2024-12-19",
    "dateModified": "2024-12-19"
  };

  // Add structured data to head
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(structuredData);
  document.head.appendChild(script);

  // Preconnect to external domains for performance
  const createLinkTag = (rel, href, type = null) => {
    const link = document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    if (type) link.setAttribute('type', type);
    document.head.appendChild(link);
  };

  // Performance optimizations
  createLinkTag('preconnect', 'https://fonts.googleapis.com');
  createLinkTag('preconnect', 'https://fonts.gstatic.com', 'crossorigin');
  createLinkTag('preconnect', 'https://www.googletagmanager.com');
  createLinkTag('dns-prefetch', 'https://www.google-analytics.com');
}

registerRootComponent(App);
