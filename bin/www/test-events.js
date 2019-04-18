const ev = require('../../utils/events');
const logger = require('../../utils/logger');

module.exports = serverSocket => {
  // socket connection
  serverSocket.on(ev.CONNECTION, clientSocket => {
    // Testing events
    logger.info(`Client ${clientSocket.id} connected`);

    // socket disconnection
    clientSocket.on(ev.DISCONNECT, () => {
      logger.info(`Client ${clientSocket.id} disconnected`);
    });

    // ECHO
    clientSocket.on(ev.TEST_COM_ECHO, data => {
      const { message } = data;
      logger.info('client says:' + message);
      const responseToClient = { status: 200, message: 'SERVER ECHO' };
      clientSocket.emit(ev.TEST_RES_ECHO, responseToClient);
    });

    // BELLO
    clientSocket.on(ev.TEST_COM_BELLO, data => {
      const { message } = data;
      logger.info('client says:' + message);
      const responseToClient = { status: 200, message: 'SERVER BELLO' };
      clientSocket.emit(ev.TEST_RES_BELLO, responseToClient);
    });
  });
};
