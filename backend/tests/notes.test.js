const request = require('supertest');
const app = require('../server');
const pool = require('../config/database');

describe('Notes Endpoints', () => {
  let testUser;
  let authToken;
  let testNoteId;

  beforeAll(async () => {
    // Test kullanıcısı oluştur
    testUser = {
      firstName: 'Notes',
      lastName: 'Tester',
      email: `notestest${Date.now()}@example.com`,
      password: 'test123456',
      timezoneOffset: 180
    };

    // Kullanıcıyı kaydet ve token al
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerResponse.body.token;
  });

  afterAll(async () => {
    // Test verilerini temizle
    if (testUser.email) {
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    }
    await pool.end();
  });

  describe('POST /api/notes', () => {
    it('should create a new note successfully', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content',
        box_type: 'daily'
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('note');
      expect(response.body.note.title).toBe(noteData.title);
      expect(response.body.note.content).toBe(noteData.content);
      expect(response.body.note.box_type).toBe(noteData.box_type);

      testNoteId = response.body.note.id;
    });

    it('should create note with default box_type if not provided', async () => {
      const noteData = {
        title: 'Default Box Note',
        content: 'This note should default to daily box'
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(201);

      expect(response.body.note.box_type).toBe('daily');
    });

    it('should not create note without authentication', async () => {
      const noteData = {
        title: 'Unauthorized Note',
        content: 'This should fail'
      };

      await request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(401);
    });
  });

  describe('GET /api/notes', () => {
    it('should get all notes for authenticated user', async () => {
      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      expect(response.body.notes.length).toBeGreaterThan(0);
    });

    it('should filter notes by box_type', async () => {
      const response = await request(app)
        .get('/api/notes?box_type=daily')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.notes.forEach(note => {
        expect(note.box_type).toBe('daily');
      });
    });

    it('should not get notes without authentication', async () => {
      await request(app)
        .get('/api/notes')
        .expect(401);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update note successfully', async () => {
      const updateData = {
        title: 'Updated Test Note',
        content: 'This is updated content',
        box_type: 'weekly'
      };

      const response = await request(app)
        .put(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.note.title).toBe(updateData.title);
      expect(response.body.note.content).toBe(updateData.content);
      expect(response.body.note.box_type).toBe(updateData.box_type);
    });

    it('should not update non-existent note', async () => {
      const updateData = {
        title: 'Non-existent Note',
        content: 'This should fail'
      };

      const response = await request(app)
        .put('/api/notes/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not bulunamadı');
    });

    it('should not update note without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update',
        content: 'This should fail'
      };

      await request(app)
        .put(`/api/notes/${testNoteId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let noteToDelete;

    beforeEach(async () => {
      // Her test için silinecek bir not oluştur
      const noteData = {
        title: 'Note to Delete',
        content: 'This will be deleted',
        box_type: 'daily'
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);

      noteToDelete = response.body.note.id;
    });

    it('should delete note successfully', async () => {
      const response = await request(app)
        .delete(`/api/notes/${noteToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Not ve ilişkili resimler silindi');
    });

    it('should not delete non-existent note', async () => {
      const response = await request(app)
        .delete('/api/notes/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not bulunamadı');
    });

    it('should not delete note without authentication', async () => {
      await request(app)
        .delete(`/api/notes/${noteToDelete}`)
        .expect(401);
    });
  });

  describe('GET /api/notes/review', () => {
    it('should get review notes for authenticated user', async () => {
      const response = await request(app)
        .get('/api/notes/review')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
    });

    it('should not get review notes without authentication', async () => {
      await request(app)
        .get('/api/notes/review')
        .expect(401);
    });
  });

  describe('POST /api/notes/:id/review', () => {
    it('should process review successfully with correct answer', async () => {
      const response = await request(app)
        .post(`/api/notes/${testNoteId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ remembered: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Review endpoint mesajını kontrol etmeyelim çünkü değişken olabilir
    });

    it('should process review successfully with incorrect answer', async () => {
      const response = await request(app)
        .post(`/api/notes/${testNoteId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ remembered: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Review endpoint mesajını kontrol etmeyelim çünkü değişken olabilir
    });

    it('should not process review without authentication', async () => {
      await request(app)
        .post(`/api/notes/${testNoteId}/review`)
        .send({ remembered: true })
        .expect(401);
    });
  });
}); 