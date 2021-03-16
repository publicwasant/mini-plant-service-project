const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const index_route = require('./routes/index');
const customer_route = require('./routes/user/customer/customer');
const customer_login_route = require('./routes/user/login/login');
const customer_register_route = require('./routes/user/register/register');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    next();
});

app.use('/', index_route);
app.use('/user/customer', customer_route);
app.use('/user/login', customer_login_route);
app.use('/user/register', customer_register_route);

app.use((req, res) => {
    res.status(400);
    res.send('400 Bad request, service not found!');
});

module.exports = app;