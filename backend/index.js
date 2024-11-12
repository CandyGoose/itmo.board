const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
mongoose.connect('mongodb://localhost:27017/mango')
  .then(()=> {
    console.log('Database connected');
  }).catch((error)=> {
    console.log('Error connecting to database: '+ error);
});
app.use(bodyParser.json());

require('./views/Board.view')(app);

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
    console.log(`Server is running at site: http://localhost:${port}`);
});

module.exports = server;
