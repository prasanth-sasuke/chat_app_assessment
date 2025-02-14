module.exports = (sequelize, DataTypes) => {
  const UploadJob = sequelize.define('UploadJob', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    totalFiles: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    processedFiles: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return UploadJob;
}; 