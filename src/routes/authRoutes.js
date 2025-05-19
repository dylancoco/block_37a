const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/client');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/register', async (req, res) => {
    const {email, password} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    try{
        const result = await pool.query(`
            INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email
            `, [email, hashedPassword])
        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    }catch(err){
        res.status(500).json({error: 'Error registering user'})
    }
})

router.post('/login', async(req, res) => {
    const {email, password} = req.body
    try{
        const result = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [email])
        if(result.rows.length > 0){
            const user = result.rows[0]
            const validPassword = await bcrypt.compare(password, user.password)
            if(validPassword){
                const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'})
                return res.json({token})
            }
        }
        res.status(400).json({error: "Invalid credentials"})
    }catch(error){
        res.status(500).json({error: 'Error loggin in'})
    }
})

router.get('/me', async(req, res) => {
    const token = req.headers.authorization?.split(' ')[1]
    if(!token) return res.status(401).json({error: "Unauthorized"})
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const result = await pool.query(`
            SELECT id, email FROM users WHERE id = $1
            `, [decoded.userId])
        res.json(result.rows[0])
    }catch(error){
        res.status(500).json({error: 'Error retrieving user info'})
    }
})

module.exports = router