const ioClient = require('socket.io-client');
const ev = require('../utils/events');
const logger = require('../utils/logger');

const createInitSocket = (adress, port, namespace = '/') => {
  return new Promise((resolve, reject) => {
    // Setup
    // Do not hardcode server port and address, square brackets are used for IPv6
    const clientSocket = ioClient.connect(`http://[${adress}]:${port}${namespace}`, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    });

    // define event handler for successfull connection
    clientSocket.on(ev.CONNECT, () => {
      resolve(clientSocket);
    });

    //if connection takes longer than 5 seconds throw an error
    setTimeout(() => {
      reject(new Error('Failed to connect within 5 seconds'));
    }, 5000);
  });
};

// destroySocket returns a promise
// success: resolve true
// fail: reject false
const destroySocket = socket => {
  return new Promise((resolve, reject) => {
    //socket connected
    if (socket.connected) {
      // disconnect socket
      socket.disconnect();
      resolve(true);
    } else {
      // not connected
      resolve(false);
    }
  });
};

// Server response
const createServerResponse = (clientSocket, eventName) => {
  return new Promise((resolve, reject) => {
    clientSocket.on(eventName, async serverData => {
      //process data received from server
      logger.info('Server says: ' + serverData);

      //destroy socket after server responds
      await destroySocket(clientSocket);

      // return data to test
      resolve(serverData);
    });

    //if response takes longer than 5 seconds throw error
    setTimeout(() => {
      reject(new Error('Failed to get response, connection timed out...'));
    }, 5000);
  });
};

exports.createInitSocket = createInitSocket;
exports.destroySocket = destroySocket;
exports.createServerResponse = createServerResponse;
