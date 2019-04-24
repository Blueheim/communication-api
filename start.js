const server = require('./bin/www/server');

const { serverInstance, serverNamespace } = server(process.env.NODE_ENV || 5000);
