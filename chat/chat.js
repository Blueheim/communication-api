const Filter = require('bad-words');

const ev = require('../utils/events');
const logger = require('../utils/logger');

const { addUser, removeUser, getUser, getUsersInRoom } = require('../utils/users.js');

module.exports = serverSocket => {
  // socket connection
  serverSocket.on(ev.CONNECTION, clientSocket => {
    clientSocket.on('mirror', data => {
      clientSocket.emit('mirror', data);
    });

    // ON JOIN ROOM
    clientSocket.on(ev.CHAT_JOIN_ROOM, ({ roomName, message, userName }, callback) => {
      const { error, user } = addUser({ id: clientSocket.id, userName: userName, roomName });

      console.log(user);

      if (error) {
        return callback(error);
      }

      clientSocket.join(roomName);

      clientSocket.broadcast.to(user.roomName).emit(ev.CHAT_MESSAGE, message);
      serverSocket.to(user.roomName).emit(ev.CHAT_USER_JOIN, {
        roomName: user.roomName,
        users: getUsersInRoom(user.roomName),
      });

      callback();
    });

    // ON NEW BROADCAST MESSAGE
    clientSocket.on(ev.CHAT_NEW_BROADCAST_MESSAGE, (message, callback) => {
      console.log(clientSocket.id);
      const user = getUser(clientSocket.id);
      console.log(user);

      const filter = new Filter();

      if (filter.isProfane(message.text)) {
        return callback('Profanity is not allowed');
      }

      clientSocket.broadcast.to(user.roomName).emit(ev.CHAT_MESSAGE, message);
      callback();
    });

    // ON NEW MESSAGE
    // clientSocket.on(ev.CHAT_NEW_MESSAGE, (message, callback) => {
    //   const user = getUser(clientSocket.id);

    //   const filter = new Filter();

    //   if (filter.isProfane(message.text)) {
    //     return callback('Profanity is not allowed');
    //   }

    //   clientSocket.to(user.roomName).emit(ev.CHAT_MESSAGE, message);
    //   callback();
    // });

    // SOCKET DISCONNECTION
    clientSocket.on(ev.DISCONNECT, () => {
      const user = removeUser(clientSocket.id);
      if (user) {
        logger.info(`Client ${clientSocket.id} disconnected from chat`);
        //clientSocket.broadcast.to(user.roomName).emit(ev.CHAT_MESSAGE, `${user.userName} has left`);
      }
    });
  });
};
