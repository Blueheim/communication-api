const app = require('../../app');
const { Server } = require('@blueheim/node-utils');
const socket = require('../../utils/socket');
const ev = require('../../utils/events');
const logger = require('../../utils/logger');

module.exports = port => {
  const serverInstance = new Server('express', app, port);
  serverInstance.start();

  const serverSocket = socket.init(serverInstance.getHandler());

  // if (process.env.NODE_ENV === 'test') {
  //   require('./test-events')(serverSocket);
  // } else {
  const nsp = serverSocket.of('/chat');
  require('../../chat/chat')(nsp);
  // }

  return { serverInstance, serverNamespace: nsp };
};
