const request = require('supertest');
const app = require('../server');
const pool = require('../config/database');

describe('Authentication Endpoints', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Test için temiz bir kullanıcı oluştur
    testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456',
      timezoneOffset: 180
    };
  });

  afterAll(async () => {
    // Test kullanıcısını temizle
    if (testUser.email) {
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    }
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.first_name).toBe(testUser.firstName);
      expect(response.body.user.last_name).toBe(testUser.lastName);

      authToken = response.body.token;
    });

    it('should not register user with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.message).toBe('Kullanıcı zaten mevcut');
    });

    it('should not register user with missing fields', async () => {
      const incompleteUser = {
        firstName: 'Test',
        email: 'incomplete@example.com'
        // Missing lastName, password
      };

      await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(500); // Server error due to missing fields
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not login with incorrect password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Geçersiz kimlik bilgileri');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'somepassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Geçersiz kimlik bilgileri');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.message).toBe('Token bulunamadı, erişim reddedildi');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.message).toBe('Geçersiz token');
    });
  });
}); 