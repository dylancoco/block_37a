const request = require('supertest');
const app = require('../src/index')
const pool = require('../src/db/client')

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser8@example.com',
        password: 'password3'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 't',
        password: 't'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return current user info when token is valid', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser8@example.com',
        password: 'password3'
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body).toHaveProperty('email', 'testuser8@example.com');
  });
});

afterAll(async () => {
  await pool.end(); 
});