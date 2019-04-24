const Filter = require('bad-words');

const ev = require('../utils/events');
const logger = require('../utils/logger');

const { convertUrlToLink } = require('../utils/string');
const { addUser, removeUser, getUser, getUsersInRoom, updateUser } = require('../utils/users.js');

module.exports = serverSocket => {
  // socket connection
  serverSocket.on(ev.CONNECTION, clientSocket => {
    logger.info(`Client ${clientSocket.id} connected to the chat`);

    clientSocket.on('mirror', data => {
      clientSocket.emit('mirror', data);
    });

    // ON JOIN ROOM
    clientSocket.on(ev.CHAT_JOIN_ROOM, ({ roomName, message, userName }, callback) => {
      console.log(roomName);
      const { error, user } = addUser({ id: clientSocket.id, userName: userName, roomName: roomName });

      console.log(user);

      if (error) {
        return callback(error);
      }

      clientSocket.join(roomName);

      clientSocket.to(user.roomName).emit(ev.CHAT_MESSAGE, message);
      serverSocket.to(user.roomName).emit(ev.CHAT_ROOM_DATA, {
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

      clientSocket.broadcast.emit(ev.CHAT_MESSAGE, message);
      callback();
    });

    //ON NEW MESSAGE
    clientSocket.on(ev.CHAT_NEW_MESSAGE, (message, callback) => {
      const user = getUser(clientSocket.id);

      const filter = new Filter();

      if (filter.isProfane(message.text)) {
        return callback('Profanity is not allowed');
      }

      message.text = convertUrlToLink(message.text);

      console.log(user);
      console.log(message);

      serverSocket.to(user.roomName).emit(ev.CHAT_MESSAGE, message);
      callback();
    });

    //ON USER STATUS
    clientSocket.on(ev.CHAT_USER_STATUS, (status, callback) => {
      const user = getUser(clientSocket.id);

      if (user.status !== status) {
        user.status = status;

        updateUser(user);

        serverSocket.to(user.roomName).emit(ev.CHAT_ROOM_DATA, {
          roomName: user.roomName,
          users: getUsersInRoom(user.roomName),
        });
      }

      callback();
    });

    //ON USER TRUST
    clientSocket.on(ev.CHAT_USER_TRUST, ({ userId, value }, callback) => {
      const user = getUser(userId);

      if (user && (user.trustRate + value >= 0 && user.trustRate + value <= 1)) {
        user.trustRate += value;

        console.log(user);

        updateUser(user);

        serverSocket.to(user.roomName).emit(ev.CHAT_ROOM_DATA, {
          roomName: user.roomName,
          users: getUsersInRoom(user.roomName),
        });
      }

      callback();
    });

    // SOCKET DISCONNECTION
    clientSocket.on(ev.DISCONNECT, () => {
      const user = removeUser(clientSocket.id);
      if (user) {
        logger.info(`Client ${clientSocket.id} disconnected from chat`);
        clientSocket.to(user.roomName).emit(ev.CHAT_MESSAGE, `${user.userName} has left`);
        serverSocket.to(user.roomName).emit(ev.CHAT_USER_LEFT, {
          roomName: user.roomName,
          users: getUsersInRoom(user.roomName),
        });
      }
    });
  });
};
