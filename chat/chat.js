const ev = require('../utils/events');
const logger = require('../utils/logger');

let roomName = 'default';

module.exports = serverSocket => {
  // socket connection
  serverSocket.on(ev.CONNECTION, clientSocket => {
    logger.info(`Client ${clientSocket.id} connected to chat`);

    logger.info(`Client ${clientSocket.id} joined the ${roomName} room`);
    clientSocket.join(roomName);

    // ON NEW USER CONNECTED
    clientSocket.on(ev.CHAT_NEW_CONNECTION, userName => {
      const broadcastResponse = { type: 'info', message: `${userName} joined the chat` };
      clientSocket.broadcast.to(roomName).emit(ev.CHAT_INFO_MESSAGE, broadcastResponse);
    });

    // ON NEW MESSAGE
    clientSocket.on(ev.CHAT_MESSAGE, message => {
      const response = message;
      clientSocket.broadcast.to(roomName).emit(ev.CHAT_MESSAGE, response);
    });

    // SOCKET DISCONNECTION
    clientSocket.on(ev.DISCONNECT, () => {
      logger.info(`Client ${clientSocket.id} disconnected from chat`);
    });
  });
};
