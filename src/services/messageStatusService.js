// 2. Message Status Service
const markMessageAsRead = async (messageId, userId) => {
  const readStatus = await MessageReadStatus.create({
    messageId,
    userId,
    readAt: new Date()
  });

  io.emit('message_read', {
    messageId,
    userId,
    readAt: readStatus.readAt
  });

  return readStatus;
}; 