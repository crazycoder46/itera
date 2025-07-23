// Test ortamı için gerekli ayarlar
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';

// Test için zaman aşımını artır
jest.setTimeout(30000);

// Konsol uyarılarını bastır
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('Warning:')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Test sonrası temizlik
afterAll(async () => {
  // Açık handle'ları temizle
  await new Promise(resolve => setTimeout(resolve, 500));
}); 