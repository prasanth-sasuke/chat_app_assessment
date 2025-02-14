// 1. User Presence Service
const userPresence = new Map();

const updateUserStatus = async (userId, status) => {
  userPresence.set(userId, {
    status,
    lastSeen: new Date()
  });
  
  io.emit('user_status_changed', {
    userId,
    status,
    lastSeen: new Date()
  });
};

const getUsersOnline = () => {
  return Array.from(userPresence.entries())
    .map(([userId, data]) => ({
      userId,
      ...data
    }));
}; 