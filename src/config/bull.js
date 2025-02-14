const Bull = require('bull');

const uploadQueue = new Bull('file-upload-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
});

module.exports = {
  uploadQueue
}; 