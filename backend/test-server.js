const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Itera API Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Test auth route (without database)
app.post('/api/test/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Tüm alanlar gerekli' });
  }
  
  res.status(201).json({
    message: 'Test kayıt başarılı',
    user: { firstName, lastName, email }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test Server is running on port ${PORT}`);
  console.log(`📍 Test URL: http://localhost:${PORT}`);
}); 