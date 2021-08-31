const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    next();
});

app.use('/', require('./routes/index'));

app.use('/user/login', require('./routes/user/login/login'));
app.use('/user/register', require('./routes/user/register/register'));

app.use('/user/customer', require('./routes/user/customer/customer'));
app.use('/user/customer/reset_password', require('./routes/user/customer/reset_password/reset_password'));
app.use('/user/customer/edit', require('./routes/user/customer/edit/edit'));

app.use('/user/employee', require('./routes/user/employee/employee'));
app.use('/user/employee/reset_password', require('./routes/user/employee/reset_password/reset_password'));
app.use('/user/employee/add', require('./routes/user/employee/add/add'));
app.use('/user/employee/edit', require('./routes/user/employee/edit/edit'));

app.use('/shop', require('./routes/shop/shop'));
app.use('/shop/rating', require('./routes/shop/rating/rating'))
app.use('/shop/add', require('./routes/shop/add/add'));
app.use('/shop/edit', require('./routes/shop/edit/edit'));

app.use('/product', require('./routes/product/product'));
app.use('/product/add', require('./routes/product/add/add'));
app.use('/product/edit', require('./routes/product/edit/edit'));

app.use('/promotion', require('./routes/promotion/promotion'));
app.use('/promotion/add', require('./routes/promotion/add/add'));
app.use('/promotion/edit', require('./routes/promotion/edit/edit'));

app.use('/order', require('./routes/order/order'));
app.use('/order/confirm', require('./routes/order/confirm/confirm'));
app.use('/order/item', require('./routes/order/item/item'));
app.use('/order/item/add', require('./routes/order/item/add/add'));
app.use('/order/item/edit', require('./routes/order/item/edit/edit'));
app.use('/order/item/remove', require('./routes/order/item/remove/remove'));

app.use('/shipment/', require('./routes/shipment/shipment'));
app.use('/shipment/add', require('./routes/shipment/add/add'));
app.use('/shipment/edit', require('./routes/shipment/edit/edit'));

app.use('/payment', require('./routes/payment/payment'));
app.use('/payment/add', require('./routes/payment/add/add'));
app.use('/payment/edit', require('./routes/payment/edit/edit'));

app.use('/media/image', require('./routes/media/image/image'));
app.use('/media/image/add', require('./routes/media/image/add/add'));

app.use((req, res) => {
    res.status(400);
    res.send('400 Bad request, service not found!');
});

module.exports = app;