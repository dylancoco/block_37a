const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes');
const items = require('./routes/items')
const reviews = require('./routes/reviews')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/items', items)
app.use('/api/', reviews)

app.get('/', (req, res) => {
    res.send('Server is working');
  });

if(process.env.NODE_ENV !== 'test'){
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    })
}

module.exports = app;