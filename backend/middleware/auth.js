const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı, erişim reddedildi' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'itera_jwt_secret_key_2024');
    req.userId = decoded.userId;
    req.user = { id: decoded.userId }; // HomeScreen için uyumluluk
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

module.exports = auth; 