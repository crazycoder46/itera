import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function RichTextEditor({ initialContent = '', onContentChange }) {
  const webViewRef = useRef(null);
  const iframeRef = useRef(null);
  const { apiCall } = useAuth();
  const { getText } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [editorContent, setEditorContent] = useState(initialContent);

  const isWeb = Platform.OS === 'web';

  // Resim yükleme fonksiyonu
  const uploadImage = async (imageUri, noteId = null) => {
    try {
      console.log('Uploading image:', imageUri);
      
      // Base64 veriyi blob'a çevir
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      
      // Note ID varsa ekle
      if (noteId) {
        formData.append('noteId', noteId);
      }
      
      console.log('Calling API...');
      const apiResponse = await apiCall('/api/notes/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          // Content-Type'ı otomatik olarak ayarlansın
        }
      });
      
      console.log('API Response:', apiResponse);
      
      if (apiResponse.success) {
        return apiResponse.imageUrl;
      } else {
        throw new Error(apiResponse.message || 'Resim yüklenemedi');
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      throw new Error('Bağlantı hatası: ' + error.message);
    }
  };

  // Resim seçme fonksiyonu
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Kaliteyi biraz düşür
        base64: false, // Base64 kullanma
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Seçilen resim:', result.assets[0]);
        
        try {
          // Önce placeholder göster - Base64 ile
          const placeholderImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzNiODJmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+WcO8a2xlbml5b3IuLi48L3RleHQ+PC9zdmc+';
          
          // Platform'a göre placeholder mesaj gönder
          if (isWeb && iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              type: 'INSERT_IMAGE',
              imageUrl: placeholderImageUrl,
              isPlaceholder: true
            }), '*');
          } else if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'INSERT_IMAGE',
              imageUrl: placeholderImageUrl,
              isPlaceholder: true
            }));
          }
          
          // Gerçek resmi yükle
          const imageUrl = await uploadImage(result.assets[0].uri);
          const fullImageUrl = `http://localhost:3000${imageUrl}`;
          
          console.log('Yüklenen resim URL:', fullImageUrl);
          
          // Gerçek resimle değiştir
          if (isWeb && iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              type: 'REPLACE_PLACEHOLDER',
              oldUrl: placeholderImageUrl,
              newUrl: fullImageUrl
            }), '*');
          } else if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'REPLACE_PLACEHOLDER',
              oldUrl: placeholderImageUrl,
              newUrl: fullImageUrl
            }));
          }
          
        } catch (uploadError) {
          console.error('Resim yükleme başarısız:', uploadError);
          
          // Hata durumunda placeholder'ı hata mesajıyla değiştir - Base64 ile
          const errorImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+WcO8a2xlbmVtZWRpPC90ZXh0Pjwvc3ZnPg==';
          
          if (isWeb && iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              type: 'REPLACE_PLACEHOLDER',
              oldUrl: placeholderImageUrl,
              newUrl: errorImageUrl
            }), '*');
          } else if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'REPLACE_PLACEHOLDER',
              oldUrl: placeholderImageUrl,
              newUrl: errorImageUrl
            }));
          }
          
          Alert.alert('Hata', 'Resim yüklenemedi. Lütfen tekrar deneyin.');
        }
      }
    } catch (error) {
      console.error('Resim seçme hatası:', error);
      Alert.alert('Hata', 'Resim seçilirken hata oluştu');
    }
  };

  // Basit HTML editör içeriği (TipTap yerine)
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rich Text Editor</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 20px;
    }
    
    .editor-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }
    
    .toolbar button {
      padding: 8px 12px;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .toolbar button:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }
    
    .toolbar button.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .editor {
      min-height: 400px;
      padding: 20px;
      border: 1px solid #e9ecef;
      border-radius: 0 0 8px 8px;
      outline: none;
      font-size: 16px;
      line-height: 1.6;
    }
    
    .editor:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
    
    .editor h1 {
      font-size: 2em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }
    
    .editor h2 {
      font-size: 1.5em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }
    
    .editor h3 {
      font-size: 1.2em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }
    
    .editor ul, .editor ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    .editor blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-left: 4px solid #007bff;
      background: #f8f9fa;
      font-style: italic;
    }
    
    .editor img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 10px 0;
      display: block;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    
    .editor img:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .editor img.selected {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }
    
    .editor img.resizing {
      outline: 2px dashed #007bff;
      outline-offset: 2px;
    }
    
    .placeholder-image {
      opacity: 0.6;
      filter: blur(1px);
    }
    
    .error-image {
      opacity: 0.7;
      border: 2px dashed #dc3545;
    }
    
    .resize-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #007bff;
      border: 2px solid white;
      border-radius: 50%;
      cursor: nw-resize;
      display: none;
    }
    
    .resize-handle.bottom-right {
      bottom: -5px;
      right: -5px;
    }
    
    .image-container {
      position: relative;
      display: inline-block;
    }
    
    .image-container:hover .resize-handle {
      display: block;
    }
    
    .image-container.selected .resize-handle {
      display: block;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="execCommand('bold')" id="bold-btn">B</button>
    <button onclick="execCommand('italic')" id="italic-btn">I</button>
    <button onclick="execCommand('underline')" id="underline-btn">U</button>
    <button onclick="execCommand('strikeThrough')" id="strike-btn">S</button>
    <button onclick="formatBlock('h1')" id="h1-btn">H1</button>
    <button onclick="formatBlock('h2')" id="h2-btn">H2</button>
    <button onclick="formatBlock('h3')" id="h3-btn">H3</button>
    <button onclick="formatBlock('p')" id="p-btn">P</button>
    <button onclick="execCommand('insertUnorderedList')" id="ul-btn">• List</button>
    <button onclick="execCommand('insertOrderedList')" id="ol-btn">1. List</button>
    <button onclick="toggleQuote()" id="quote-btn">Quote</button>
    <button onclick="insertImage()" id="image-btn">📷 Image</button>
  </div>
  <div 
    class="editor" 
    contenteditable="true" 
    id="editor"
    data-placeholder="Buraya yazmaya başlayın..."
  ></div>
  
  <script>
    let editor;
    let isQuoteActive = false;
    let selectedImage = null;
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    function initEditor() {
      editor = document.getElementById('editor');
      
      if (!editor) {
        console.error('Editor element not found');
        return;
      }
      
      setupImageHandling();
      setupResizeHandling();
      
      // Event listeners'ı burada ekle
      editor.addEventListener('input', function() {
        updateToolbar();
        notifyContentChange();
      });
      editor.addEventListener('keyup', function() {
        updateToolbar();
        notifyContentChange();
      });
      editor.addEventListener('mouseup', updateToolbar);
      
      // Placeholder text
      if (editor.innerHTML.trim() === '') {
        editor.innerHTML = '<p>Notunuzu buraya yazın...</p>';
      }
      
      // Mevcut resimleri wrap et (sayfa yüklendiğinde)
      setTimeout(() => {
        const existingImages = editor.querySelectorAll('img');
        existingImages.forEach(img => {
          if (!img.parentNode.classList.contains('image-container')) {
            wrapImageInContainer(img);
          }
        });
      }, 50);
      
      // Parent'a editörün hazır olduğunu bildir
      window.parent.postMessage(JSON.stringify({
        type: 'EDITOR_READY'
      }), '*');
    }
    
    function setupImageHandling() {
      if (!editor) return;
      
      // Resim seçme
      editor.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG') {
          selectImage(e.target);
        } else {
          deselectImage();
        }
      });
      
      // Resim yükleme sonrası setup - daha kapsamlı observer
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // Yeni eklenen node'ları kontrol et
          mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'IMG') {
              if (node.dataset.wrapped === 'true') return;
              console.log('New image detected:', node.src);
              setTimeout(() => wrapImageInContainer(node), 10);
            } else if (node.nodeType === 1) {
              // Element ise içindeki resimleri de kontrol et
              const images = node.querySelectorAll('img');
              images.forEach(img => {
                if (img.dataset.wrapped === 'true') return;
                console.log('Image found in added element:', img.src);
                setTimeout(() => wrapImageInContainer(img), 10);
              });
            }
          });
          
          // Değişen attribute'ları kontrol et (src değişikliği gibi)
          if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG') {
            console.log('Image attribute changed:', mutation.target.src);
            if (mutation.target.dataset.wrapped !== 'true') {
              setTimeout(() => wrapImageInContainer(mutation.target), 10);
            }
          }
        });
      });
      
      observer.observe(editor, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['src'] 
      });
    }
    
    function wrapImageInContainer(img) {
      // Aynı resim bir kez sarılsın – dataset ile işaretle
      if (img.dataset.wrapped === 'true') {
        // Zaten wrap edilmiş, ancak handle eksik olabilir (eski not). Devam et.
      }

      let container;
      if (img.parentNode.classList.contains('image-container')) {
        // Zaten sarılı
        container = img.parentNode;
      } else {
        // Container oluştur
        container = document.createElement('div');
        container.className = 'image-container';
        // Resmi container'a sarma
        const parent = img.parentNode;
        parent.insertBefore(container, img);
        container.appendChild(img);
      }

      // Resize handle kontrolü/oluştur
      let resizeHandle = container.querySelector('.resize-handle.bottom-right');
      if (!resizeHandle) {
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle bottom-right';
        container.appendChild(resizeHandle);
      }

      // Event listener'lar sadece bir kez eklensin
      if (!resizeHandle.dataset.listenerAttached) {
        resizeHandle.addEventListener('mousedown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          startResize(e, img);
        });
        // Mobile/touch desteği
        resizeHandle.addEventListener('touchstart', function(e) {
          e.preventDefault();
          e.stopPropagation();
          startResize(e, img);
        }, { passive: false });

        // Pointer events (tek çözüm)
        resizeHandle.addEventListener('pointerdown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          startResize(e, img);
          // Drag boyunca aynı handle'ın capture etmesi
          resizeHandle.setPointerCapture(e.pointerId);
        });
        resizeHandle.dataset.listenerAttached = 'true';
      }

      // Sarıldığını işaretle
      img.dataset.wrapped = 'true';
      console.log('Ensured image container & handle:', img.src);
    }
    
    function selectImage(img) {
      deselectImage();
      selectedImage = img;
      img.classList.add('selected');
      
      const container = img.parentNode;
      if (container.classList.contains('image-container')) {
        container.classList.add('selected');
      }
    }
    
    function deselectImage() {
      if (selectedImage) {
        selectedImage.classList.remove('selected');
        const container = selectedImage.parentNode;
        if (container.classList.contains('image-container')) {
          container.classList.remove('selected');
        }
        selectedImage = null;
      }
    }
    
    function setupResizeHandling() {
      if (!editor) return;
      
      document.addEventListener('mousemove', function(e) {
        if (isResizing && selectedImage) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          const newWidth = Math.max(50, startWidth + deltaX);
          const newHeight = Math.max(50, startHeight + deltaY);
          
          selectedImage.style.width = newWidth + 'px';
          selectedImage.style.height = newHeight + 'px';
          selectedImage.style.maxWidth = 'none';
          
          const container = selectedImage.parentNode;
          if (container && container.classList.contains('image-container')) {
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
          }
        }
      });

      document.addEventListener('pointermove', function(e) {
        if (isResizing && selectedImage) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;

          const newWidth = Math.max(50, startWidth + deltaX);
          const newHeight = Math.max(50, startHeight + deltaY);

          selectedImage.style.width = newWidth + 'px';
          selectedImage.style.height = newHeight + 'px';
          selectedImage.style.maxWidth = 'none';

          const container = selectedImage.parentNode;
          if (container && container.classList.contains('image-container')) {
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
          }
        }
      });
      
      document.addEventListener('mouseup', function() {
        if (isResizing) {
          isResizing = false;
          if (selectedImage) {
            selectedImage.classList.remove('resizing');
            // Boyut değişikliğini kaydet
            notifyContentChange();
          }
        }
      });

      document.addEventListener('pointerup', function() {
        if (isResizing) {
          isResizing = false;
          if (selectedImage) {
            selectedImage.classList.remove('resizing');
            notifyContentChange();
          }
        }
      });
    }
    
    function notifyContentChange() {
      if (!editor) return;
      
      // Parent component'e içerik değiştiğini bildir
      window.parent.postMessage(JSON.stringify({
        type: 'CONTENT_CHANGED',
        content: editor.innerHTML
      }), '*');
    }
    
    function startResize(e, img) {
      isResizing = true;
      selectedImage = img;
      img.classList.add('resizing');
      
      // Dokunmatik, mouse veya pointer koordinatlarını ayarla
      const point = e.touches && e.touches.length > 0 ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      startWidth = img.offsetWidth;
      startHeight = img.offsetHeight;
      
      e.preventDefault();
    }
    
    function execCommand(command, value = null) {
      if (!editor) return;
      document.execCommand(command, false, value);
      editor.focus();
      updateToolbar();
      notifyContentChange();
    }
    
    function toggleFormat(command) {
      if (!editor) return;
      execCommand(command);
      updateToolbar();
    }
    
    function setHeading(level) {
      if (!editor) return;
      if (level === 'p') {
        execCommand('formatBlock', '<p>');
      } else {
        execCommand('formatBlock', '<h' + level + '>');
      }
      updateToolbar();
    }
    
    function toggleList(type) {
      if (!editor) return;
      execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
      updateToolbar();
    }
    
    function toggleQuote() {
      if (!editor) return;
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.nodeType === 1 ? 
          range.commonAncestorContainer : range.commonAncestorContainer.parentNode;
        
        const blockquote = parentElement.closest('blockquote');
        
        if (blockquote) {
          // Blockquote'dan çıkar
          const parent = blockquote.parentNode;
          while (blockquote.firstChild) {
            parent.insertBefore(blockquote.firstChild, blockquote);
          }
          parent.removeChild(blockquote);
          isQuoteActive = false;
        } else {
          // Blockquote oluştur
          execCommand('formatBlock', '<blockquote>');
          isQuoteActive = true;
        }
      }
      updateToolbar();
      notifyContentChange();
    }
    
    function formatBlock(tag) {
      if (!editor) return;
      if (tag === 'p') {
        execCommand('formatBlock', '<p>');
      } else {
        execCommand('formatBlock', '<' + tag + '>');
      }
      updateToolbar();
    }
    
    function updateToolbar() {
      const commands = ['bold', 'italic', 'underline', 'strikeThrough'];
      commands.forEach(command => {
        const button = document.querySelector('[onclick*="' + command + '"]');
        if (button) {
          if (document.queryCommandState(command)) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        }
      });
      
      // Blockquote durumunu kontrol et
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.nodeType === 1 ? 
          range.commonAncestorContainer : range.commonAncestorContainer.parentNode;
        
        const blockquote = parentElement.closest('blockquote');
        const quoteButton = document.querySelector('[onclick*="toggleQuote"]');
        
        if (blockquote && quoteButton) {
          quoteButton.classList.add('active');
          isQuoteActive = true;
        } else if (quoteButton) {
          quoteButton.classList.remove('active');
          isQuoteActive = false;
        }
      }
    }
    
    function insertImage() {
      window.parent.postMessage(JSON.stringify({
        type: 'PICK_IMAGE'
      }), '*');
    }
    
    function insertImageToEditor(imageUrl, isPlaceholder = false) {
      if (!editor) return;
      
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = 'Uploaded image';
      
      if (isPlaceholder) {
        img.classList.add('placeholder-image');
      }
      
      // Cursor pozisyonuna ekle
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor.appendChild(img);
      }
      
      // Container'a wrap et
      setTimeout(() => {
        wrapImageInContainer(img);
        // Resim eklendikten sonra içerik değişikliğini bildir
        if (!isPlaceholder) {
          notifyContentChange();
        }
      }, 10);
      
      return img;
    }
    
    function replacePlaceholder(oldUrl, newUrl) {
      if (!editor) return;
      const images = editor.querySelectorAll('img');
      images.forEach(img => {
        if (img.src === oldUrl) {
          img.src = newUrl;
          img.classList.remove('placeholder-image');
          img.classList.remove('error-image');
          
          // Resmi wrap et (eğer değilse)
          setTimeout(() => {
            if (!img.parentNode.classList.contains('image-container')) {
              wrapImageInContainer(img);
            }
          }, 10);
        }
      });
      // Placeholder değiştirildikten sonra bildirim gönder
      notifyContentChange();
    }
    
    function showError(oldUrl) {
      if (!editor) return;
      const images = editor.querySelectorAll('img');
      images.forEach(img => {
        if (img.src === oldUrl) {
          img.classList.remove('placeholder-image');
          img.classList.add('error-image');
        }
      });
    }
    
    // Dış pencereden mesaj alma
    window.addEventListener('message', function(event) {
      // Bazı platformlarda event.data zaten obje olabilir; yalnızca string olanları parse et
      if (typeof event.data !== 'string') {
        return; // Geçersiz format, atla
      }
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'INSERT_IMAGE') {
          insertImageToEditor(data.imageUrl, data.isPlaceholder);
        } else if (data.type === 'REPLACE_PLACEHOLDER') {
          replacePlaceholder(data.oldUrl, data.newUrl);
        } else if (data.type === 'SHOW_ERROR') {
          showError(data.oldUrl);
        } else if (data.type === 'GET_CONTENT') {
          if (editor) {
            window.parent.postMessage(JSON.stringify({
              type: 'CONTENT_RESPONSE',
              content: editor.innerHTML
            }), '*');
          }
        } else if (data.type === 'SET_CONTENT') {
          if (editor) {
            editor.innerHTML = data.content || '<p>Notunuzu buraya yazın...</p>';
            // Mevcut resimleri wrap et
            setTimeout(() => {
              const images = editor.querySelectorAll('img');
              images.forEach(img => {
                if (!img.parentNode.classList.contains('image-container')) {
                  wrapImageInContainer(img);
                }
              });
              
              // Editör hazır olduğunu bildir
              window.parent.postMessage(JSON.stringify({
                type: 'EDITOR_READY'
              }), '*');
            }, 100); // Biraz daha uzun süre bekle
          }
        }
      } catch (error) {
        console.error('Message parsing error:', error);
      }
    });
    
    // Sayfa yüklendiğinde editörü başlat
    document.addEventListener('DOMContentLoaded', initEditor);
  </script>
</body>
</html>`;

  // Web için iframe mesaj işleyicisi
  useEffect(() => {
    if (isWeb) {
      const handleIframeMessage = (event) => {
        try {
          // Event.data string mi kontrol et
          if (typeof event.data !== 'string') {
            return;
          }
          
          const message = JSON.parse(event.data);
          
          if (message.type === 'CONTENT_CHANGED') {
            setEditorContent(message.content);
            onContentChange?.(message.content);
          } else if (message.type === 'EDITOR_READY') {
            setIsLoading(false);
            if (initialContent && iframeRef.current) {
              iframeRef.current.contentWindow.postMessage(JSON.stringify({
                type: 'SET_CONTENT',
                content: initialContent
              }), '*');
            }
          } else if (message.type === 'PICK_IMAGE') {
            pickImage();
          } else if (message.type === 'REQUEST_IMAGE') {
            pickImage();
          } else if (message.type === 'EDITOR_ERROR') {
            console.error('TipTap Editor Error:', message.error);
            setIsLoading(false);
          }
        } catch (error) {
          // JSON parse hatalarını sessizce geç
          return;
        }
      };

      window.addEventListener('message', handleIframeMessage);
      return () => window.removeEventListener('message', handleIframeMessage);
    }
  }, [isWeb, initialContent, onContentChange]);

  // WebView mesaj işleyicisi
  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'CONTENT_CHANGED') {
        setEditorContent(message.content);
        onContentChange?.(message.content);
      } else if (message.type === 'EDITOR_READY') {
        setIsLoading(false);
        if (initialContent) {
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'SET_CONTENT',
            content: initialContent
          }));
        }
      } else if (message.type === 'PICK_IMAGE') {
        pickImage();
      } else if (message.type === 'REQUEST_IMAGE') {
        pickImage();
      } else if (message.type === 'EDITOR_ERROR') {
        console.error('TipTap Editor Error:', message.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Mesaj işleme hatası:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Native resim ekleme butonu */}
      <View style={styles.nativeToolbar}>
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>
            {getText('language') === 'en' ? '📷 Add Image' : '📷 Resim Ekle'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Platform'a göre editör */}
      {isWeb ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={styles.iframe}
          title="TipTap Editor"
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {getText('language') === 'en' ? 'Loading editor...' : 'Editör yükleniyor...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  nativeToolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  iframe: {
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: 8,
    width: '100%',
    minHeight: 400,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});
