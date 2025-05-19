const request = require('supertest');
const app = require('../src/index')
const pool = require('../src/db/client')

describe('Items Routes', () => {
    // Test GET /api/items
    it('should return an array of items', async () => {
      const res = await request(app).get('/api/items');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  
    // Test GET /api/items/:itemId
    it('should return an item by ID or 404 if not found', async () => {
      const res = await request(app).get('/api/items/1'); 
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('id');
      } else {
        expect(res.statusCode).toBe(404);
      }
    });
  
    // Test GET /api/items/:itemId/reviews
    it('should return reviews for a specific item', async () => {
      const res = await request(app).get('/api/items/1/reviews'); 
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  afterAll(async () => {
    await pool.end();
  });