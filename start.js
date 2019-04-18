const server = require('./bin/www/server');

const { serverInstance, serverSocket } = server();

console.log(serverSocket);
