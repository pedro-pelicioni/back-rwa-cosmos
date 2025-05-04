const request = require('supertest');
const app = require('./setup');

describe('Health Check Endpoint', () => {
  it('should return 200 OK and a success message', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
  });
}); 