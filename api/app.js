const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const index_route = require('./routes/index');

const user_login_route = require('./routes/user/login/login');
const user_register_route = require('./routes/user/register/register');

const user_customer_route = require('./routes/user/customer/customer');
const user_customer_reset_password_route = require('./routes/user/customer/reset_password/reset_password');
const user_customer_edit_route = require('./routes/user/customer/edit/edit');

const user_employee_route = require('./routes/user/employee/employee');
const user_employee_reset_password_route = require('./routes/user/employee/reset_password/reset_password');
const user_employee_add_route = require('./routes/user/employee/add/add');
const user_employee_edit_roure = require('./routes/user/employee/edit/edit');

const product_route = require('./routes/product/product');
const product_add_route = require('./routes/product/add/add');
const product_edit_route = require('./routes/product/edit/edit');

const order_route = require('./routes/order/order');
const order_add_route = require('./routes/order/add/add');
const order_detail_route = require('./routes/order/detail/detail');
const order_detail_add_route = require('./routes/order/detail/add/add');
const order_detail_connectToOrder_route = require('./routes/order/detail/connectToOrder/connectToOrder');

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

app.use('/user/login', user_login_route);
app.use('/user/register', user_register_route);

app.use('/user/customer', user_customer_route);
app.use('/user/customer/reset_password', user_customer_reset_password_route);
app.use('/user/customer/edit', user_customer_edit_route);

app.use('/user/employee', user_employee_route);
app.use('/user/employee/reset_password', user_employee_reset_password_route);
app.use('/user/employee/add', user_employee_add_route);
app.use('/user/employee/edit', user_employee_edit_roure);

app.use('/product', product_route);
app.use('/product/add', product_add_route);
app.use('/product/edit', product_edit_route);

app.use('/order', order_route);
app.use('/order/add', order_add_route);
app.use('/order/detail', order_detail_route);
app.use('/order/detail/add', order_detail_add_route);
app.use('/order/detail/connectToOrder', order_detail_connectToOrder_route);

app.use((req, res) => {
    res.status(400);
    res.send('400 Bad request, service not found!');
});

module.exports = app;