const request = require('supertest');
const app = require('./setup');
const { users } = require('../mocks/data');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: users[0].email,
          password: 'password123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 when email already exists', async () => {
      const existingUser = {
        name: 'Existing User',
        email: users[0].email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email já cadastrado');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Token não fornecido');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout realizado com sucesso');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('token', 'mock-jwt-token');
      expect(response.body).toHaveProperty('refreshToken', 'mock-refresh-token');
    });
  });
}); 