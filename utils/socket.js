const ioServer = require('socket.io');

let socket;

module.exports = {
  init: httpServer => {
    socket = ioServer(httpServer);
    return socket;
  },
  getSocket: () => {
    if (!socket) {
      throw new Error('Socket not initialized!');
    }
    return socket;
  },
};
