const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const customer_route = require('./api/routes/customer/customer');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    next();
});

app.use('/customer', customer_route);

app.use(function (req, res) {
    res.status(400);
    res.send('400 Bad request, service not found!');
});

module.exports = app;