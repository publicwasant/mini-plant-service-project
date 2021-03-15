const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const root_route = require('./api/routes/root');
const customer_route = require('./api/routes/customer/customer');
const customer_login_route = require('./api/routes/customer/login/login');
const customer_register_route = require('./api/routes/customer/register/register');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    next();
});

app.use('/', root_route);
app.use('/customer', customer_route);
app.use('/customer/login', customer_login_route);
app.use('/customer/register', customer_register_route);

app.use(function (req, res) {
    res.status(400);
    res.send('400 Bad request, service not found!');
});

module.exports = app;