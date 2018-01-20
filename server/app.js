'use strict';

const express = require('express');
const path = require('path');

const app = express();

const PORT = 5975;

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function (req, res) {
    res.send('Hello World')
});

app.listen(PORT);
