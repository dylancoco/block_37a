const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/client');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/', async(req, res) => {
    try{
        const results = await pool.query(`SELECT * FROM items`);
        res.json(results.rows)
    }catch(error){
        res.status(500).json({error: "Failed to fetch items"})
    }
})

router.get('/:itemId', async(req, res) => {
    const { itemId } = req.params
    try{
        const result = await pool.query('SELECT * FROM items WHERE id = $1', [itemId])
        if(result.rows.length === 0){
            return res.status(404).json({error: "Item not found"})
        }
        res.json(result.rows[0])
    }catch(error){
        res.status(500).json({error: "Failed to fetch item"})
    }
})

router.get('/:itemId/reviews', async(req, res) => {
    const { itemId } = req.params
    try{
        const result = await pool.query("SELECT body FROM reviews WHERE item_id = $1", [itemId])
        res.json(result.rows)
    }catch(error){
        res.status(500).json({error: "Failed to fetch reviews"})
    }
})

module.exports = router