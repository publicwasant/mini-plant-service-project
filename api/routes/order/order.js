const express = require('express');
const router = express.Router();

const token = require('./../../../jwt_token');

const alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM orders WHERE order_id=?",
            values: [param.id]
        };
    } else if (param.customer_id) {
        return {
            sql: "SELECT * FROM orders WHERE cus_id=?",
            values: [param.customer_id]
        };
    } else if (param.employee_id) {
        return {
            sql: "SELECT * FROM orders WHERE emp_id=?",
            values: [param.employee_id]
        };
    } else {
        return {
            sql: "SELECT * FROM orders",
            values: []
        };
    }
}

const reorganize = (token, items, then) => {
    const fetch = (ind) => {
        env.get({token: token, url: "/order/item?order_id=*", params: [items[ind].order_id], then: (orderitems) => {
            env.get({url: "/user/customer?id=*", params: [items[ind].cus_id], then: (customers) => {
                env.get({url: "/user/employee?id=*", params: [items[ind].emp_id], then: (employees) => {
                    items[ind] = {
                        id: items[ind].order_id,
                        type: items[ind].order_type,
                        date: items[ind].order_date,
                        total_price: items[ind].order_totalPrice,
                        customer: customers.status == 1 ? customers.data[0] : null,
                        employee: employees.status == 1 ? employees.data[0] : null,
                        order_items: orderitems.data,
                        shipment: {
                            bill: items[ind].ship_bill,
                            status: items[ind].ship_status
                        },
                        payment: {
                            status: items[ind].pay_status
                        }
                    };

                    if (ind + 1 < items.length) {
                        fetch (ind + 1);
                    } else {
                        then(items);
                    }
                }});
            }});
        }});
    };

    fetch(0);
};

router.get('/', token.auth((payload, done) => {
    token.verify(payload, (result) => {
        return done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = 'ไม่าสามารถทำรายการได้';
            form.output.error = err;
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(input.header.authorization, result, (items) => {
                form.output.status = 1;
                form.output.descript = 'พบข้อมูลแล้ว ' + items.length + ' รายการ';
                form.output.data = items;

                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = 'ไม่พบข้อมูล';
            form.output.data = [];

            return res.json(form.output);
        }
    });
});

module.exports = router;