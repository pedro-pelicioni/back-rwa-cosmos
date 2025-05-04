const request = require('supertest');
const app = require('./setup');
const { users } = require('../mocks/data');

describe('Users Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: users[0].email,
        password: 'password123'
      });
    authToken = response.body.token;
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser2@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('user');
    });

    it('should return 400 for duplicate email', async () => {
      const existingUser = {
        name: 'Existing User',
        email: users[0].email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(existingUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email já cadastrado');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .send({
          name: 'Updated Name',
          email: 'updated@example.com'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).toHaveProperty('email', 'updated@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .send({
          name: 'Updated Name'
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });

  describe('PATCH /api/users/:id/password', () => {
    it('should update user password', async () => {
      const response = await request(app)
        .patch(`/api/users/${users[0].id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Senha atualizada com sucesso');
    });

    it('should return 400 for incorrect current password', async () => {
      await request(app)
        .patch(`/api/users/${users[0].id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        })
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('GET /api/users/:id/orders', () => {
    it('should return user orders', async () => {
      const response = await request(app)
        .get('/api/users/1/orders')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const response = await request(app)
        .delete('/api/users/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Usuário deletado com sucesso');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });
}); 