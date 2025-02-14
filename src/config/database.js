const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: "chat_app",
  username: "postgres",
  password: "Admin",
  host: "localhost",
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
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

module.exports = sequelize;

// Add this to your database configuration
const messagePartitioningQuery = `
  CREATE TABLE IF NOT EXISTS messages_partition OF messages
  PARTITION BY RANGE (created_at);

  CREATE TABLE messages_y2024m01 
  PARTITION OF messages_partition
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
`; 