const Bull = require('bull');
const { File, UploadJob } = require('../models');
const { processFile } = require('../utils/fileProcessor');

const fileQueue = new Bull('file-processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  limiter: {
    max: 1000, // Max jobs per timeframe
    duration: 5000 // Timeframe in milliseconds
  }
});

// Add job progress monitoring
fileQueue.on('progress', async (job, progress) => {
  await UploadJob.update(
    { processedFiles: progress },
    { where: { id: job.data.jobId } }
  );
});

// Add error handling
fileQueue.on('failed', async (job, err) => {
  await File.update(
    { status: 'failed', error: err.message },
    { where: { id: job.data.fileId } }
  );
  
  await UploadJob.update(
    { status: 'failed', error: err.message },
    { where: { id: job.data.jobId } }
  );
});

module.exports = fileQueue; 