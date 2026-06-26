const Message = require('../models/Message');

module.exports = function registerChatHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a conversation room between two users
    socket.on('chat:join', ({ userId, peerId }) => {
      if (!userId || !peerId) return;
      const roomId = [userId, peerId].sort().join('_');
      socket.join(roomId);
      console.log(`[Socket] User ${userId} joined chat room ${roomId}`);
    });

    // Send a message
    socket.on('chat:send', async ({ senderId, receiverId, content }) => {
      if (!senderId || !receiverId || !content.trim()) return;

      const roomId = [senderId, receiverId].sort().join('_');
      
      try {
        // Save message to database
        const message = new Message({
          sender: senderId,
          receiver: receiverId,
          content: content.trim()
        });
        await message.save();

        // Emit message to everyone in the room
        io.to(roomId).emit('chat:message', message);
      } catch (err) {
        console.error('[Socket] Error saving chat message:', err);
      }
    });

    // Handle typing indicator
    socket.on('chat:typing', ({ senderId, receiverId, isTyping }) => {
      if (!senderId || !receiverId) return;
      const roomId = [senderId, receiverId].sort().join('_');
      // Broadcast to all except sender
      socket.to(roomId).emit('chat:typing', { senderId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
