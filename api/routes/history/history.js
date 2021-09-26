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

const reorganize = (time, items, then) => {
    const result = [];

    const fetch = (i) => {
        env.get("/order?id=*", [items[i].oitem_order_id], (orders) => {
            env.get("/product?id=*", [items[i].oitem_product_id], (products) => {
                env.get("/user/customer?id=*", [items[i].oitem_customer_id], (customers) => {
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
                        if (between(time.from, time.to, orders.data[0].date))
                            result.push(items[i]);
                    } else if (time.date != null) {
                        if (inDate(time.date, orders.data[0].date))
                            result.push(items[i]);
                    } else {
                        result.push(items[i]);
                    }
                    
                    if (i + 1 < items.length) {
                        fetch (i + 1);
                    } else {
                        then(result);
                    }
                });
            });
        });
    };

    fetch(0);
};

const between = (from, to, date) => {
    const dFrom = new Date(from);
    const dTo = new Date(to);
    const dDate = new Date(date);

    return (dDate <= dTo && dDate >= dFrom);
};

const inDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (d1.getFullYear() == d2.getFullYear())
        && (d1.getMonth() == d2.getMonth())
        && (d1.getDate() == d2.getDate());
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
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize({
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