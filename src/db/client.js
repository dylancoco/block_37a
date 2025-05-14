const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Read database URL from .env
});

module.exports = pool;
