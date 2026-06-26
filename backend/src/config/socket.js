const { Server } = require('socket.io');
const registerChatHandlers = require('../socket/chatHandler');

module.exports = function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  // Register real-time chat events
  registerChatHandlers(io);

  return io;
};
