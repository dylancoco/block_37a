const pool = require('./client');
console.log('Connecting to DB...', process.env.DATABASE_URL); // Check the connection string


async function createTables() {
    try{
        console.log('Connecting to database at:', process.env.DATABASE_URL)
        console.log('Connecting to DB...'); // Log for connection
        await pool.query('SELECT NOW()'); // Simple query to check DB connection
        await pool.query(`
                CREATE TABLE IF NOT EXISTS users(
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `)
        await pool.query(`
                CREATE TABLE IF NOT EXISTS items(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `)
        await pool.query(`
                CREATE TABLE IF NOT EXISTS reviews(
                    id SERIAL PRIMARY KEY,
                    body TEXT NOT NULL,
                    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments(
                id SERIAL PRIMARY KEY,
                body TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `)
        await pool.query(`
            INSERT INTO users (email, password)
            VALUES 
              ('alice@example.com', 'hashedpassword1'),
              ('bob@example.com', 'hashedpassword2')
            ON CONFLICT DO NOTHING;
          `);
      
          // Insert sample items
          await pool.query(`
            INSERT INTO items (name, description)
            VALUES 
              ('Laptop', 'A powerful laptop'),
              ('Phone', 'A fast smartphone')
            ON CONFLICT DO NOTHING;
          `);
      
          // Insert a sample review
          await pool.query(`
            INSERT INTO reviews (user_id, item_id, rating, body)
            VALUES 
              (1, 1, 5, 'Amazing product!'),
              (2, 2, 4, 'Pretty good phone.')
            ON CONFLICT DO NOTHING;
          `);
      
          // Insert a sample comment
          await pool.query(`
            INSERT INTO comments (user_id, review_id, body)
            VALUES 
              (1, 1, 'I agree!'),
              (2, 2, 'Thanks for the info.')
            ON CONFLICT DO NOTHING;
          `);
    }catch(err){
        console.log('Error creating tables: ', err)
    }finally {
        await pool.end()
    }
}

createTables()