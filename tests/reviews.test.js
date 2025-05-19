const request = require('supertest');
const app = require('../src/index')
const pool = require('../src/db/client')

let token;
let userId;
let itemId = 1; 
let reviewId;

beforeAll(async () => {
  // Login as existing test user
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 't', 
    password: 't'         
  });

  token = loginRes.body.token;
  expect(token).toBeTruthy();

  // Get user ID from /me endpoint
  const userRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  userId = userRes.body.id;
  expect(userId).toBeTruthy();
});

afterAll(async () => {
  await pool.end();
});

describe('Review Routes', () => {
  // POST /api/items/:itemId/reviews
  it('should create a review for an item', async () => {
    const res = await request(app)
      .post(`/api/items/${itemId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        body: 'This is a test review.',
        rating: 5
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.body).toBe('This is a test review.');
    reviewId = res.body.id;
  });

  // GET /api/items/:itemId/reviews/:reviewId
  it('should fetch the created review by ID', async () => {
    const res = await request(app)
      .get(`/api/items/${itemId}/reviews/${reviewId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(reviewId);
    expect(res.body.item_id).toBe(itemId);
  });

  // GET /api/reviews/me
  it('should fetch all reviews by the logged-in user', async () => {
    const res = await request(app)
      .get('/api/reviews/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(r => r.id === reviewId)).toBe(true);
  });

  // PUT /api/users/:userId/reviews/:reviewId
  it('should update the review by the same user', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        body: 'Updated comment!',
        rating: 4
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.rating).toBe(4);
    expect(res.body.body).toBe('Updated comment!');
  });
});