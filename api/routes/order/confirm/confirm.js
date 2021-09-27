const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

router.post('/', token.auth((payload, done) => {
    payload.status == 1 ? token.verify(payload, (result) => {
        done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, ["employee_id"]);

    if (vat.valid) {
        const sqls = "SELECT SUM(oitem_price) AS total_price FROM orderitems WHERE oitem_order_id IS NULL";
        
        env.database.query(sqls, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง";
                form.output.error = err;
                form.output.data = [];
        
                return res.json(form.output);
            }

            if (result.length > 0) {
                const total_price = result[0].total_price;
                const sql = "INSERT INTO orders (order_type, order_totalPrice, cus_id, emp_id) VALUES ?";
                const values = [[
                    input.body.type,
                    total_price,
                    input.body.customer_id,
                    input.body.employee_id,
                ]];

                env.database.query(sql, [values], (err, result) => {
                    if (err) {
                        form.output.status = 0;
                        form.output.descript = "เกิดข้อผิดพลาดบางอย่าง";
                        form.output.error = err;
                        form.output.data = [];

                        return res.json(form.output);
                    }

                    if (result.affectedRows > 0) {
                        const order_id = result.insertId;
                        const sqld = "UPDATE orderitems SET oitem_order_id=? WHERE oitem_order_id IS ? AND oitem_customer_id=?";
                        const valuesd = [order_id, null, input.body.customer_id];

                        env.database.query(sqld, valuesd, (err, result) => {
                            if (err) {
                                form.output.status = 0;
                                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง";
                                form.output.error = err;
                                form.output.data = [];
                
                                return res.json(form.output);
                            }

                            if (result.affectedRows > 0) {
                                env.get({token: input.header.authorization, url: "/order?id=*", params: [order_id], then: (o) => {
                                    form.output.status = 1;
                                    form.output.descript = "ทำรายการสำเร็จแล้ว";
                                    form.output.data = o.data[0];

                                    return res.json(form.output);
                                }});
                            } else {
                                form.output.status = 0;
                                form.output.descript = "ทำรายการไม่สำเร็จ!";
                                form.output.error = "statement is not affected to rows.";
                                form.output.data = [];

                                return res.json(form.output);
                            }
                        });
                    } else {
                        form.output.status = 0;
                        form.output.descript = "ทำรายการไม่สำเร็จ!";
                        form.output.data = [];

                        return res.json(form.output);
                    }
                });
            } else {
                form.output.status = 0;
                form.output.descript = "ทำรายการไม่สำเร็จ!";
                form.output.data = [];

                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.data = [];

        return res.json(form.output);
    }
});

module.exports = router;