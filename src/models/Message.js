module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('text', 'file'),
      defaultValue: 'text'
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return Message;
}; 