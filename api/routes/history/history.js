const express = require('express');
const router = express.Router();

const token = require('./../../../jwt_token');

const alternate = (param) => {
    if (param.customer_id) {
        return {
            sql: "SELECT * FROM orderitems WHERE oitem_customer_id=? ORDER BY oitem_id DESC",
            values: [param.customer_id]
        };
    } else if (param.product_id) {
        return {
            sql: "SELECT * FROM orderitems WHERE oitem_product_id=? ORDER BY oitem_id DESC",
            values: [param.product_id]
        };
    } else {
        return {
            sql: "SELECT * FROM orderitems ORDER BY oitem_id DESC",
            values: []
        };
    }
};

const reorganize = (token, time, items, then) => {
    const result = [];
    const fetch = (i) => {
        env.get({token: token, url: "/order?id=*", params: [items[i].oitem_order_id], then: (orders) => {
            env.get({url: "/product?id=*", params: [items[i].oitem_product_id], then: (products) => {
                env.get({url: "/user/customer?id=*", params: [items[i].oitem_customer_id], then: (customers) => {
                    items[i] = {
                        order: orders.status == 1 ? {
                            id: orders.data[0].id,
                            type: orders.data[0].type,
                            date: orders.data[0].date
                        } : null,
                        item: {
                            id: items[i].oitem_id,
                            amount: items[i].oitem_amount,
                            product: products.status == 1 ? products.data[0] : null,
                            customer: customers.status == 1 ? customers.data[0] : null,
                        },
                    };

                    if (time.from != null && time.to != null) {
                        if (env.date.between(time.from, time.to, orders.data[0].date))
                            result.push(items[i]);
                    } else if (time.date != null) {
                        if (env.date.equals(time.date, orders.data[0].date))
                            result.push(items[i]);
                    } else {
                        result.push(items[i]);
                    }
                    
                    if (i + 1 < items.length) {
                        fetch (i + 1);
                    } else {
                        then(result);
                    }
                }});
            }});
        }});
    };

    fetch(0);
};

router.get('/', token.auth((payload, done) => {
    token.verify(payload, (result) => {
        done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(input.header.authorization, {
                from: input.url.form,
                to: input.url.to,
                date: input.url.date
            }, result, (items) => {
                form.output.status = 1;
                form.output.descript = "พบข้อมูลแล้ว " + items.length + " รายการ";
                form.output.data = items;

                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูล!";
            form.output.data = result;

            return res.json(form.output);
        }
    });
});

module.exports = router;