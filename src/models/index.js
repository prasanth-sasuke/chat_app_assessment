const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Message = require('./Message');
const ActivityLog = require('./ActivityLog');
const File = require('./File');
const UploadJob = require('./UploadJob');
const TokenBlacklist = require('./TokenBlacklist');

// Initialize models
const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Message: Message(sequelize, Sequelize.DataTypes),
  ActivityLog: ActivityLog(sequelize, Sequelize.DataTypes),
  File: File(sequelize, Sequelize.DataTypes),
  UploadJob: UploadJob(sequelize, Sequelize.DataTypes),
  TokenBlacklist: TokenBlacklist(sequelize, Sequelize.DataTypes)
};

// Set up associations
models.User.hasMany(models.Message, { as: 'sentMessages', foreignKey: 'senderId' });
models.Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });

models.User.hasMany(models.ActivityLog);
models.ActivityLog.belongsTo(models.User);

models.User.hasMany(models.File, { foreignKey: 'uploadedBy' });
models.File.belongsTo(models.User, { foreignKey: 'uploadedBy' });

models.User.hasMany(models.UploadJob, { foreignKey: 'userId' });
models.UploadJob.belongsTo(models.User, { foreignKey: 'userId' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  models
}; 