const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

const cors = require('cors');

const port = process.env.PORT || 4000;

const allowedOrigins = ['http://5.255.100.205:6531'];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://5.255.100.205:6531');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Private-Network', true);
    //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
    res.setHeader('Access-Control-Max-Age', 7200);

    next();
});

mongoose
    .connect('mongodb://mongo:27017/mango')
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.log('Error connecting to database: ' + error);
    });
app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

require('./views/ImageUpload.view')(app);
require('./views/Board.view')(app);

app.listen(port, () => {
    console.log(`Server is running at site: http://localhost:${port}`);
});
