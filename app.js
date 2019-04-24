const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: 'https://enigmatic-brook-39936.herokuapp.com',
  })
);

module.exports = app;
