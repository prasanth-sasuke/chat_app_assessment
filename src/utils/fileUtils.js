const fs = require('fs');
const path = require('path');

const createUploadDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/temp',
    'uploads/processed'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  });
};

module.exports = {
  createUploadDirectories
}; 