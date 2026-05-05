const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://root:password@localhost:5432/traffic',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
