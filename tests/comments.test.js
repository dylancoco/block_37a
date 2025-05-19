const request = require('supertest');
const app = require('../src/index');
const pool = require('../src/db/client');

let token;
let userId;
let itemId;
let reviewId;
let commentId;

beforeAll(async () => {
  // Login user
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 't',
    password: 't'
  });

  token = loginRes.body.token;

  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  userId = meRes.body.id;

  // Create item
  const itemRes = await pool.query(
    `INSERT INTO items (name, description) VALUES ('Test Item', 'Just for testing') RETURNING id`
  );
  itemId = itemRes.rows[0].id;

  // Create review
  const reviewRes = await pool.query(
    `INSERT INTO reviews (body, rating, user_id, item_id) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['This is a test review', 5, userId, itemId]
  );
  reviewId = reviewRes.rows[0].id;
});

afterAll(async () => {
  await pool.query(`DELETE FROM comments WHERE review_id = $1`, [reviewId]);
  await pool.query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);
  await pool.query(`DELETE FROM items WHERE id = $1`, [itemId]);
  await pool.end();
});

describe('POST /api/items/:itemId/reviews/:reviewId/comments', () => {
  it('should post a comment successfully', async () => {
    const res = await request(app)
      .post(`/api/items/${itemId}/reviews/${reviewId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        body: 'This is a test comment.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.body).toBe('This is a test comment.');
  });

  it('should return 401 if user is not authenticated', async () => {
    const res = await request(app)
      .post(`/api/items/${itemId}/reviews/${reviewId}/comments`)
      .send({ body: 'Should be unauthorized' });

    expect(res.statusCode).toBe(401);
  });
  it('should post a comment to be fetched/deleted later', async () => {
    const res = await request(app)
      .post(`/api/items/${itemId}/reviews/${reviewId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Another test comment' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    commentId = res.body.id; // Save for later
  });

  it('should fetch the logged-in user\'s comments', async () => {
    const res = await request(app)
      .get('/api/comments/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(c => c.id === commentId)).toBe(true);
  });

  it('should delete the user\'s own comment', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });

  it('should return 404 when deleting a comment that no longer exists', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
