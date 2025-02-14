const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Add database partitioning for messages if needed
if (process.env.NODE_ENV === 'development') {
  const messagePartitioningQuery = `
    CREATE TABLE IF NOT EXISTS messages_partition OF messages
    PARTITION BY RANGE (created_at);

    CREATE TABLE messages_y2024m01 
    PARTITION OF messages_partition
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
  `;
}

module.exports = sequelize; 