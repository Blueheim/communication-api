const ev = require('../utils/events');
const logger = require('../utils/logger');
const server = require('../bin/www/server');
const { createInitSocket, destroySocket, createServerResponse } = require('../utils/testHelpers');

let serverInstance;
let serverAddr;
let serverSocket;

// Test format in 3 parts:
//1. unit under test
//2. Scenario
//3. Expectation
describe('1/ Test suite: events', () => {
  let clientSocket = null;
  let serverObject = null;

  beforeAll(async () => {
    jest.setTimeout(10000);
    ({ serverInstance, serverSocket } = server(null)); // null port means dynamic port
    serverAddr = serverInstance.getHandler().address();
    clientSocket = await createInitSocket(serverAddr.address, serverAddr.port, '/chat');
  });

  afterAll(async () => {
    await serverInstance.close();
  });

  describe('2/ Test chat and room connection', () => {
    it('3/ should connect to the chat namespace', () => {
      try {
        const isConnected = !!serverSocket.nsps['/chat'].connected[clientSocket.id];

        // check the response data
        expect(isConnected).toBeTruthy();
      } catch (err) {
        logger.error(err);
      }
    });
    it('3/ should join the `default` room', () => {
      try {
        const hasJoinedRoom = serverSocket.nsps['/chat'].adapter.rooms['default'].sockets[clientSocket.id];

        // check the response data
        expect(hasJoinedRoom).toBeTruthy();
      } catch (err) {
        logger.error(err);
      }
    });
  });

  describe('2/ Test messages', () => {
    it('3/ chat connection info message', async () => {
      const clientSocketMate = await createInitSocket(serverAddr.address, serverAddr.port, '/chat');
      const serverResponse = createServerResponse(clientSocketMate, ev.CHAT_INFO_MESSAGE);

      const userName = 'Xavier';
      // emit event with data to server
      clientSocket.emit(ev.CHAT_NEW_CONNECTION, userName);
      // wait for server to respond
      const { type, message } = await serverResponse;
      // check the response data
      expect(type).toBe('info');
      expect(message).toBe(`${userName} joined the chat`);
    });
  });
});
