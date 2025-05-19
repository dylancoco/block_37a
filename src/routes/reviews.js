const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/client');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/auth')
const router = express.Router();

router.get('/items/:itemId/reviews/:reviewId', async(req, res) => {
    const { itemId, reviewId } = req.params
    try{
        const results = await pool.query('SELECT * FROM reviews WHERE item_id = $1 AND id = $2', [itemId, reviewId])
        if(results.rows.length === 0){
            res.status(404).json({error: "Review not found"})
        }
        res.json(results.rows[0])
    }catch(err){
        res.status(500).json({error: "Failed to fetch review"})
    }
})

router.post('/items/:itemId/reviews', authenticate, async(req, res) => {
    const { itemId } = req.params
    const { body, rating } = req.body
    try{
        const result = await pool.query('INSERT INTO reviews (body, rating, user_id, item_id) VALUES ($1, $2, $3, $4) RETURNING *', [body, rating, req.user.userId, itemId])
        res.status(201).json(result.rows[0])
    }catch(err){
        res.status(500).json({error: "Failed to post review"})
    }
})

router.get('/reviews/me', authenticate, async(req, res) => {
    try{
        const results = await pool.query("SELECT * FROM reviews WHERE user_id = $1", [req.user.userId])
        res.json(results.rows)
    }catch(err){
        res.status(500).json({error: "Failed to fetch your reviews"})
    }
})

router.put('/users/:userId/reviews/:reviewId', authenticate, async(req, res) => {
    const {userId, reviewId} = req.params
    const {body, rating} = req.body
    if(parseInt(userId) !== req.user.userId){
        return res.status(403).json({error: "Cannot update another user\'s review"})
    }
    try{
        const result = await pool.query('UPDATE reviews SET body = $1, rating = $2 WHERE user_id = $3 AND id = $4 RETURNING *', [body, rating, userId, reviewId])
        if(result.rows.length === 0){
            return res.status(404).json({error: "Review not found"})
        }
        res.json(result.rows[0])
    }catch(err){
        res.status(500).json({error: "Failed to update"})
    }
})

module.exports = router