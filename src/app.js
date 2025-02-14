const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const { models } = require('./models'); // Import models
const socketService = require('./services/socketService');
require('dotenv').config();
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize socket service
socketService.init(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Database sync with logging
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced including TokenBlacklist table');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
})();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle typing status
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing_status', data);
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('typing_status', {
      ...data,
      isTyping: false
    });
  });

  // Handle user presence
  socket.on('user_active', (userId) => {
    socket.broadcast.emit('user_status', {
      userId,
      status: 'online'
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.use('/api', routes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, io }; 