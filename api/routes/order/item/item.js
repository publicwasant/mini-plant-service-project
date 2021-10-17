const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

let alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM orderitems WHERE oitem_id=?",
            values: [param.id]
        };
    } else if (param.order_id) {
        return {
            sql: "SELECT * FROM orderitems WHERE oitem_order_id=?",
            values: [param.order_id]
        };
    } else if (param.customer_id) {
        return {
            sql: "SELECT * FROM orderitems WHERE oitem_customer_id=?",
            values: [param.customer_id]
        };
    } else if (param.employee_id) {
        return {
            sql: "SELECT * FROM orderitems WHERE oitem_employee_id=?",
            values: [param.employee_id]
        };
    } else {
        return {
            sql: "SELECT * FROM orderitems ORDER BY oitem_id DESC",
            values: []
        };
    }
};

let reorganize = (items, then) => {
    let fetch = (ind) => {
        env.get({url: "/product?id=*", params: [items[ind].oitem_product_id], then: (product) => {
            env.get({url: "/user/customer?id=*", params: [items[ind].oitem_customer_id], then: (customer) => {
                env.get({url: "/user/employee?id=*", params: [items[ind].oitem_employee_id], then: (employee) => {
                    items[ind] = {
                        id: items[ind].oitem_id,
                        order_id: items[ind].oitem_order_id,
                        color: items[ind].oitem_color,
                        size: items[ind].oitem_size,
                        amount: items[ind].oitem_amount,
                        total_price: items[ind].oitem_price,
                        product: product.data[0],
                        customer: customer.data[0],
                        employee: employee.data[0]
                    };
    
                    if (ind + 1 < items.length) {
                        fetch(ind + 1);
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

    let alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = [];
            
            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(result, (r) => {
                form.output.status = 1;
                form.output.descript = "พบข้อมูลแล้ว " + result.length + " รายการ";
                form.output.error = null;
                form.output.data = r;

                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูล!";
            form.output.error = null;
            form.output.data = [];
        
            return res.json(form.output);
        }
    });
});

module.exports = router;