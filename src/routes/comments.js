const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/client');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/auth')
const router = express.Router();

router.post('/items/:itemId/reviews/:reviewId/comments', authenticate, async(req, res) => {
    const {itemId, reviewId} = req.params
    const { body } = req.body
    try{
        const results = await pool.query('INSERT INTO comments (body, user_id, review_id) VALUES ($1, $2, $3) RETURNING *', [body, req.user.userId, reviewId])
        res.status(201).json(results.rows[0])
    }catch(err){
        res.status(500).json({ error: 'Failed to post comment' });
    }
})

router.get('/comments/me', authenticate, async(req, res) => {
    try{
        const results = await pool.query('SELECT * FROM comments WHERE user_id = $1', [req.user.userId])
        res.json(results.rows)
    }catch(err){
        res.status(500).json({error: "Failed to fetch your comments"})
    }
})

router.put('/users/:userId/comments/:commentId', authenticate, async(req, res) => {
    const {userId, commentId} = req.params
    const {body} = req.body
    if(parseInt(userId) !== req.user.userId){
        return res.status(403).json({ error: 'Unauthorized to update this comment' });
    }
    try{
        const result = await pool.query(
            'UPDATE comments SET body = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [body, commentId, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found or not owned by user' });
          }
        res.json(result.rows[0]);
    }catch(err){
        res.status(500).json({ error: 'Failed to update comment' });
    }
})

router.delete('/users/:userId/comments/:commentId', authenticate, async(req, res) => {
    const { userId, commentId } = req.params;
    if (parseInt(userId) !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }
    try {
        const result = await pool.query(
          'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
          [commentId, userId]
        );
    
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Comment not found or not owned by user' });
        }
    
        res.status(204).send(); 
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
})

module.exports = router