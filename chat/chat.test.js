const ev = require('../utils/events');
const logger = require('../utils/logger');
const server = require('../bin/www/server');
const { createInitSocket, destroySocket, createServerResponse } = require('../utils/testHelpers');

let serverInstance;
let serverAddr;
let serverNamespace;

// Test format in 3 parts:
//1. unit under test
//2. Scenario
//3. Expectation
describe('1/ Test suite: events', () => {
  let clientSocket = null;
  let clientSocketMate = null;

  beforeAll(async () => {
    jest.setTimeout(10000);
    ({ serverInstance, serverNamespace } = server(null));
    // null port means dynamic port
    serverAddr = serverInstance.getHandler().address();
  });

  beforeEach(async () => {
    clientSocket = await createInitSocket(serverAddr.address, serverAddr.port, '/chat');
    clientSocketMate = await createInitSocket(serverAddr.address, serverAddr.port, '/chat');
  });

  afterEach(async () => {
    //destroy socket after server responds
    await destroySocket(clientSocket);
    await destroySocket(clientSocketMate);
  });

  afterAll(async () => {
    await serverInstance.close();
  });

  describe('2/ Test namespace and room connection', () => {
    it('3/ should connect to the chat namespace', async () => {
      try {
        //console.log(serverSocket);
        let isConnected = false;
        const name = serverNamespace.name;

        if (name === '/chat') {
          isConnected = !!serverNamespace.connected[clientSocket.id];
        }

        // check the response data
        expect(isConnected).toBeTruthy();
      } catch (err) {
        logger.error(err);
      }
    });
    it('3/ should join a room', async () => {
      try {
        const roomName = 'web';
        const message = 'Join a room';
        const userName = 'Xavier';

        const serverResponse = createServerResponse(clientSocket, ev.CHAT_USER_JOIN);

        clientSocket.emit(ev.CHAT_JOIN_ROOM, { roomName, message, userName }, () => {});

        const response = await serverResponse;

        // console.log(clientSocket.io.engine.id);
        // console.log(serverNamespace.adapter.rooms[roomName].sockets);

        const key = `/chat#${clientSocket.io.engine.id}`;

        const hasJoinedRoom = serverNamespace.adapter.rooms[roomName].sockets[key];

        // check the response data
        expect(hasJoinedRoom).toBeTruthy();
      } catch (err) {
        logger.error(err);
      }
    });
  });

  describe('2/ Test messages', () => {
    const user1 = {
      userName: 'Xavier',
      roomName: 'web',
    };

    const user2 = {
      userName: 'Anna',
      roomName: 'web',
    };

    it('3/ chat broadcast message', async () => {
      clientSocket.emit(
        ev.CHAT_JOIN_ROOM,
        { roomName: user1.roomName, message: 'User 1 join', userName: user1.userName },
        () => {}
      );

      clientSocketMate.emit(
        ev.CHAT_JOIN_ROOM,
        { roomName: user2.roomName, message: 'User 2 join', userName: user2.userName },
        () => {}
      );

      const serverResponse = createServerResponse(clientSocketMate, ev.CHAT_MESSAGE);

      clientSocket.emit(ev.CHAT_NEW_BROADCAST_MESSAGE, { text: 'My broadcast message' }, () => {});

      // wait for server to respond
      const { text } = await serverResponse;

      // check the response data
      expect(text).toBe(`My broadcast message`);
    });
  });
});
