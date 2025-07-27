import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function EditRichTextEditor({ initialContent = '', onContentChange, noteId }) {
  const webViewRef = useRef(null);
  const iframeRef = useRef(null);
  const { apiCall } = useAuth();
  const { getText } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [editorContent, setEditorContent] = useState(initialContent);

  const isWeb = Platform.OS === 'web';

  // Resim yükleme fonksiyonu
  const uploadImage = async (imageUri) => {
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
          const fullImageUrl = imageUrl; // Cloudinary URL'i direkt kullan
          
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
          
          // Resim değiştirme işleminden sonra content'i hemen güncelle
          setTimeout(() => {
            if (isWeb && iframeRef.current) {
              iframeRef.current.contentWindow.postMessage(JSON.stringify({
                type: 'FORCE_CONTENT_UPDATE'
              }), '*');
            } else if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'FORCE_CONTENT_UPDATE'
              }));
            }
          }, 100);
          
          // Resim ekleme işleminden sonra content'i güncelle
          setTimeout(() => {
            if (isWeb && iframeRef.current) {
              iframeRef.current.contentWindow.postMessage(JSON.stringify({
                type: 'GET_CONTENT'
              }), '*');
            } else if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'GET_CONTENT'
              }));
            }
          }, 1000); // Daha uzun timeout
          
          // Ek olarak, resim işleminden sonra content'i zorla güncelle
          setTimeout(() => {
            if (isWeb && iframeRef.current) {
              iframeRef.current.contentWindow.postMessage(JSON.stringify({
                type: 'FORCE_CONTENT_UPDATE'
              }), '*');
            } else if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'FORCE_CONTENT_UPDATE'
              }));
            }
          }, 2000);
          
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

  // TipTap tabanlı HTML editör içeriği (resim resize özelliği ile)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TipTap Editor with Resize</title>
        
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, sans-serif;
            background: #fff;
            color: #1f2937;
          }
          
          .editor-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            max-height: none;
          }
          
          .toolbar {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            background: #f9fafb;
            flex-shrink: 0;
          }
          
          .toolbar button {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: #fff;
            color: #374151;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }
          
          .toolbar button:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }
          
          .toolbar button.active {
            background: #3b82f6;
            color: #fff;
            border-color: #2563eb;
          }
          
          .editor {
            flex: 1;
            padding: 16px;
            overflow: auto;
            min-height: 50vh;
            outline: none;
          }
          
          /* TipTap Styles */
          .ProseMirror {
            min-height: 100%;
            outline: none;
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
            white-space: pre-wrap;
          }
          
          /* ProseMirror editör alanının kaydırma optimizasyonu */
          .ProseMirror:focus {
            outline: none;
          }
          
          .ProseMirror h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 16px 0;
            color: #1f2937;
          }
          
          .ProseMirror h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 14px 0;
            color: #1f2937;
          }
          
          .ProseMirror h3 {
            font-size: 18px;
            font-weight: bold;
            margin: 12px 0;
            color: #1f2937;
          }
          
          .ProseMirror p {
            margin: 8px 0;
            line-height: 1.6;
          }
          
          .ProseMirror strong {
            font-weight: bold;
          }
          
          .ProseMirror em {
            font-style: italic;
          }
          
          .ProseMirror code {
            background: #f3f4f6;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
          }
          
          .ProseMirror pre {
            background: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 14px;
            margin: 12px 0;
          }
          
          .ProseMirror blockquote {
            border-left: 4px solid #d1d5db;
            margin: 12px 0;
            padding-left: 16px;
            color: #6b7280;
            font-style: italic;
          }
          
          .ProseMirror ul, .ProseMirror ol {
            margin: 12px 0;
            padding-left: 24px;
          }
          
          .ProseMirror li {
            margin: 4px 0;
          }
          
          /* Image with resize */
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 12px 0;
            cursor: pointer;
            border-radius: 8px;
          }
          
          /* TipTap Image Resize Styles */
          .ProseMirror .image-resizer {
            display: inline-block;
            position: relative;
          }
          
          .ProseMirror .image-resizer img {
            display: block;
            max-width: 100%;
            height: auto;
          }
          
          .ProseMirror .image-resizer .resize-handle {
            position: absolute;
            width: 16px;
            height: 16px;
            background: #3b82f6;
            border: 2px solid #fff;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.2s;
            touch-action: none;
            cursor: pointer;
          }
          
          /* Mobilde resize handle'ları daha büyük */
          @media (max-width: 768px) {
            .ProseMirror .image-resizer .resize-handle {
              width: 20px;
              height: 20px;
              opacity: 0.8;
            }
            
            .ProseMirror .image-resizer:hover .resize-handle,
            .ProseMirror .image-resizer.ProseMirror-selectednode .resize-handle {
              opacity: 1;
            }
          }
          
          .ProseMirror .image-resizer:hover .resize-handle,
          .ProseMirror .image-resizer.ProseMirror-selectednode .resize-handle {
            opacity: 1;
          }
          
          .ProseMirror .image-resizer .resize-handle.bottom-right {
            bottom: -8px;
            right: -8px;
            cursor: se-resize;
          }
          
          /* Mobilde bottom-right handle pozisyonu */
          @media (max-width: 768px) {
            .ProseMirror .image-resizer .resize-handle.bottom-right {
              bottom: -10px;
              right: -10px;
            }
          }
          
          .ProseMirror-selectednode {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
          
          .is-empty::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
          }
        </style>
      </head>
      <body>
        <div class="editor-container">
          <div class="toolbar">
            <button onclick="window.toggleBold()" id="bold-btn"><strong>B</strong></button>
            <button onclick="window.toggleItalic()" id="italic-btn"><em>I</em></button>
            <button onclick="window.toggleCode()" id="code-btn">Code</button>
            <button onclick="window.toggleHeading(1)" id="h1-btn">H1</button>
            <button onclick="window.toggleHeading(2)" id="h2-btn">H2</button>
            <button onclick="window.toggleHeading(3)" id="h3-btn">H3</button>
            <button onclick="window.toggleBulletList()" id="ul-btn">• List</button>
            <button onclick="window.toggleOrderedList()" id="ol-btn">1. List</button>
            <button onclick="window.toggleBlockquote()" id="quote-btn">Quote</button>
            <button onclick="window.toggleCodeBlock()" id="codeblock-btn">Code Block</button>
            <button onclick="window.addImage()" id="image-btn">📷 Image</button>
          </div>
          <div class="editor" id="editor"></div>
        </div>

        <script type="module">
          // TipTap ESM imports
          import { Editor } from 'https://esm.sh/@tiptap/core@2.1.11'
          import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.1.11'
          import Image from 'https://esm.sh/@tiptap/extension-image@2.1.11'
          import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder@2.1.11'
          
          let editor;
          
          // Custom Image Extension with Resize
          const ResizableImage = Image.extend({
            addAttributes() {
              return {
                ...this.parent?.(),
                width: {
                  default: null,
                  parseHTML: element => {
                    // Önce width attribute'u kontrol et
                    const widthAttr = element.getAttribute('width');
                    if (widthAttr) return parseInt(widthAttr);
                    
                    // Sonra style'dan width değerini al
                    const styleWidth = element.style.width;
                    if (styleWidth && styleWidth.endsWith('px')) {
                      return parseInt(styleWidth);
                    }
                    
                    return null;
                  },
                  renderHTML: attributes => {
                    if (!attributes.width) {
                      return {}
                    }
                    return {
                      width: attributes.width,
                      style: 'width: ' + attributes.width + 'px'
                    }
                  }
                },
                height: {
                  default: null,
                  parseHTML: element => {
                    // Önce height attribute'u kontrol et
                    const heightAttr = element.getAttribute('height');
                    if (heightAttr) return parseInt(heightAttr);
                    
                    // Sonra style'dan height değerini al
                    const styleHeight = element.style.height;
                    if (styleHeight && styleHeight.endsWith('px')) {
                      return parseInt(styleHeight);
                    }
                    
                    return null;
                  },
                  renderHTML: attributes => {
                    if (!attributes.height) {
                      return {}
                    }
                    return {
                      height: attributes.height,
                      style: 'height: ' + attributes.height + 'px'
                    }
                  }
                }
              }
            },
            
            addNodeView() {
              return ({ node, updateAttributes, getPos, editor }) => {
                const container = document.createElement('div')
                container.className = 'image-resizer'
                container.style.display = 'inline-block'
                container.style.position = 'relative'
                
                const img = document.createElement('img')
                img.src = node.attrs.src
                img.alt = node.attrs.alt || ''
                img.title = node.attrs.title || ''
                
                // Boyutları uygula
                if (node.attrs.width) {
                  img.style.width = node.attrs.width + 'px'
                  container.style.width = node.attrs.width + 'px'
                }
                if (node.attrs.height) {
                  img.style.height = node.attrs.height + 'px'
                  container.style.height = node.attrs.height + 'px'
                }
                
                // Resize handle
                const resizeHandle = document.createElement('div')
                resizeHandle.className = 'resize-handle bottom-right'
                resizeHandle.style.position = 'absolute'
                resizeHandle.style.width = '10px'
                resizeHandle.style.height = '10px'
                resizeHandle.style.background = '#3b82f6'
                resizeHandle.style.border = '2px solid #fff'
                resizeHandle.style.borderRadius = '50%'
                resizeHandle.style.bottom = '-5px'
                resizeHandle.style.right = '-5px'
                resizeHandle.style.cursor = 'se-resize'
                
                let isResizing = false
                let startX, startY, startWidth, startHeight
                
                resizeHandle.addEventListener('mousedown', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  isResizing = true
                  startX = e.clientX
                  startY = e.clientY
                  startWidth = img.offsetWidth || parseInt(img.style.width) || img.naturalWidth
                  startHeight = img.offsetHeight || parseInt(img.style.height) || img.naturalHeight
                  
                  const handleMouseMove = (e) => {
                    if (!isResizing) return
                    
                    const deltaX = e.clientX - startX
                    const deltaY = e.clientY - startY
                    
                    const newWidth = Math.max(50, startWidth + deltaX)
                    const aspectRatio = startHeight / startWidth
                    const newHeight = Math.round(newWidth * aspectRatio)
                    
                    img.style.width = newWidth + 'px'
                    img.style.height = newHeight + 'px'
                    container.style.width = newWidth + 'px'
                    container.style.height = newHeight + 'px'
                    
                    // Resize sırasında da attribute'ları güncelle
                    updateAttributes({
                      width: newWidth,
                      height: newHeight
                    })
                  }
                  
                  const handleMouseUp = () => {
                    if (isResizing) {
                      isResizing = false
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                  }
                  
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                })
                
                // Touch event desteği - mobil için
                resizeHandle.addEventListener('touchstart', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  isResizing = true
                  const touch = e.touches[0]
                  startX = touch.clientX
                  startY = touch.clientY
                  startWidth = img.offsetWidth || parseInt(img.style.width) || img.naturalWidth
                  startHeight = img.offsetHeight || parseInt(img.style.height) || img.naturalHeight
                  
                  const handleTouchMove = (e) => {
                    if (!isResizing) return
                    e.preventDefault()
                    
                    const touch = e.touches[0]
                    const deltaX = touch.clientX - startX
                    const deltaY = touch.clientY - startY
                    
                    const newWidth = Math.max(50, startWidth + deltaX)
                    const aspectRatio = startHeight / startWidth
                    const newHeight = Math.round(newWidth * aspectRatio)
                    
                    img.style.width = newWidth + 'px'
                    img.style.height = newHeight + 'px'
                    container.style.width = newWidth + 'px'
                    container.style.height = newHeight + 'px'
                    
                    // Resize sırasında da attribute'ları güncelle
                    updateAttributes({
                      width: newWidth,
                      height: newHeight
                    })
                  }
                  
                  const handleTouchEnd = () => {
                    if (isResizing) {
                      isResizing = false
                      document.removeEventListener('touchmove', handleTouchMove)
                      document.removeEventListener('touchend', handleTouchEnd)
                    }
                  }
                  
                  document.addEventListener('touchmove', handleTouchMove, { passive: false })
                  document.addEventListener('touchend', handleTouchEnd)
                })
                
                // Resim seçildiğinde
                img.addEventListener('click', () => {
                  const pos = getPos()
                  editor.commands.setNodeSelection(pos)
                })
                
                container.appendChild(img)
                container.appendChild(resizeHandle)
                
                return {
                  dom: container,
                  contentDOM: null,
                  update: (updatedNode) => {
                    if (updatedNode.type.name !== 'image') return false
                    
                    img.src = updatedNode.attrs.src
                    img.alt = updatedNode.attrs.alt || ''
                    img.title = updatedNode.attrs.title || ''
                    
                    if (updatedNode.attrs.width) {
                      img.style.width = updatedNode.attrs.width + 'px'
                      container.style.width = updatedNode.attrs.width + 'px'
                    }
                    if (updatedNode.attrs.height) {
                      img.style.height = updatedNode.attrs.height + 'px'
                      container.style.height = updatedNode.attrs.height + 'px'
                    }
                    
                    return true
                  }
                }
              }
            }
          })
          
          // TipTap editörü başlat
          function initEditor() {
            try {
              console.log('=== TIPTAP EDITOR INIT ===');
              
              editor = new Editor({
                element: document.querySelector('#editor'),
                extensions: [
                  StarterKit,
                  ResizableImage,
                  Placeholder.configure({
                    placeholder: 'Notunuzu buraya yazın...',
                  })
                ],
                content: '',
                onUpdate: ({ editor }) => {
                  const html = editor.getHTML()
                  console.log('Editor updated, new HTML:', html);
                  notifyContentChange(html)
                  updateToolbarState()
                },
                onSelectionUpdate: ({ editor }) => {
                  updateToolbarState()
                }
              })
              
              console.log('TipTap editor initialized successfully');
              
              // Parent'a editörün hazır olduğunu bildir
              window.parent.postMessage(JSON.stringify({
                type: 'EDITOR_READY'
              }), '*')
              
            } catch (error) {
              console.error('TipTap initialization error:', error)
              window.parent.postMessage(JSON.stringify({
                type: 'EDITOR_ERROR',
                error: error.message
              }), '*')
            }
          }
          
          function notifyContentChange(content) {
            console.log('Notifying parent of content change:', content);
            window.parent.postMessage(JSON.stringify({
              type: 'CONTENT_CHANGED',
              content: content
            }), '*')
          }
          
          function updateToolbarState() {
            if (!editor) return
            
            document.getElementById('bold-btn').classList.toggle('active', editor.isActive('bold'))
            document.getElementById('italic-btn').classList.toggle('active', editor.isActive('italic'))
            document.getElementById('code-btn').classList.toggle('active', editor.isActive('code'))
            document.getElementById('h1-btn').classList.toggle('active', editor.isActive('heading', { level: 1 }))
            document.getElementById('h2-btn').classList.toggle('active', editor.isActive('heading', { level: 2 }))
            document.getElementById('h3-btn').classList.toggle('active', editor.isActive('heading', { level: 3 }))
            document.getElementById('ul-btn').classList.toggle('active', editor.isActive('bulletList'))
            document.getElementById('ol-btn').classList.toggle('active', editor.isActive('orderedList'))
            document.getElementById('quote-btn').classList.toggle('active', editor.isActive('blockquote'))
            document.getElementById('codeblock-btn').classList.toggle('active', editor.isActive('codeBlock'))
          }
          
          // Toolbar fonksiyonları - window'a ekle
          window.toggleBold = function() {
            editor.chain().focus().toggleBold().run()
          }
          
          window.toggleItalic = function() {
            editor.chain().focus().toggleItalic().run()
          }
          
          window.toggleCode = function() {
            editor.chain().focus().toggleCode().run()
          }
          
          window.toggleHeading = function(level) {
            editor.chain().focus().toggleHeading({ level }).run()
          }
          
          window.toggleBulletList = function() {
            editor.chain().focus().toggleBulletList().run()
          }
          
          window.toggleOrderedList = function() {
            editor.chain().focus().toggleOrderedList().run()
          }
          
          window.toggleBlockquote = function() {
            editor.chain().focus().toggleBlockquote().run()
          }
          
          window.toggleCodeBlock = function() {
            editor.chain().focus().toggleCodeBlock().run()
          }
          
          window.addImage = function() {
            window.parent.postMessage(JSON.stringify({
              type: 'REQUEST_IMAGE'
            }), '*')
          }
          
          // Parent'dan gelen mesajları dinle
          window.addEventListener('message', function(event) {
            try {
              const message = JSON.parse(event.data)
              console.log('Editor received message:', message.type);
              
              if (message.type === 'SET_CONTENT') {
                if (editor) {
                  console.log('Setting content:', message.content);
                  editor.commands.setContent(message.content)
                  
                  // İçeriği kontrol et
                  setTimeout(() => {
                    const currentContent = editor.getHTML();
                    console.log('Content after set:', currentContent);
                    
                    // Resimleri kontrol et
                    const editorEl = document.querySelector('#editor');
                    const images = editorEl ? editorEl.querySelectorAll('img') : [];
                    console.log('Found images:', images.length);
                    images.forEach((img, index) => {
                      console.log('Image ' + index + ':', {
                        src: img.src,
                        width: img.getAttribute('width'),
                        height: img.getAttribute('height'),
                        styleWidth: img.style.width,
                        styleHeight: img.style.height
                      });
                    });
                  }, 100);
                }
              } else if (message.type === 'INSERT_IMAGE') {
                if (editor && message.imageUrl) {
                  console.log('Inserting image:', message.imageUrl);
                  editor.chain().focus().setImage({ src: message.imageUrl }).run()
                }
              } else if (message.type === 'REPLACE_PLACEHOLDER') {
                if (editor) {
                  const content = editor.getHTML()
                  const newContent = content.replace(message.oldUrl, message.newUrl)
                  editor.commands.setContent(newContent)
                }
              } else if (message.type === 'GET_CONTENT') {
                if (editor) {
                  const content = editor.getHTML()
                  window.parent.postMessage(JSON.stringify({
                    type: 'CONTENT_CHANGED',
                    content: content
                  }), '*')
                }
              } else if (message.type === 'FORCE_CONTENT_UPDATE') {
                if (editor) {
                  const content = editor.getHTML()
                  console.log('Force content update:', content);
                  window.parent.postMessage(JSON.stringify({
                    type: 'CONTENT_CHANGED',
                    content: content
                  }), '*')
                }
              }
            } catch (error) {
              console.error('Message handling error:', error)
            }
          })
          
          // Sayfa yüklendiğinde editörü başlat
          initEditor()
        </script>
      </body>
    </html>
  `;

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
          console.log('Parent received message from iframe:', message.type);
          
          if (message.type === 'CONTENT_CHANGED') {
            console.log('Content changed, updating parent state:', message.content);
            setEditorContent(message.content);
            onContentChange?.(message.content);
          } else if (message.type === 'EDITOR_READY') {
            console.log('Editor ready, setting initial content');
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
      } else if (message.type === 'GET_CONTENT') {
        // WebView için GET_CONTENT mesajını işle
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'GET_CONTENT'
        }));
      } else if (message.type === 'FORCE_CONTENT_UPDATE') {
        // WebView için FORCE_CONTENT_UPDATE mesajını işle
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'FORCE_CONTENT_UPDATE'
        }));
      }
    } catch (error) {
      console.error('Mesaj işleme hatası:', error);
    }
  };

  return (
    <View style={styles.container}>
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
    minHeight: 400,
    maxHeight: 'none',
  },
  webView: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    minHeight: 400,
  },
  iframe: {
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: 8,
    width: '100%',
    minHeight: 500,
    resize: 'vertical',
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