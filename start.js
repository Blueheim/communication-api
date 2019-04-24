const server = require('./bin/www/server');

const { serverInstance, serverNamespace } = server(process.env.PORT || 5000);
