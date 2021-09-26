const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.post('/', token.auth((payload, done) => {
    if (payload.status != 1)
        return done(null, false);

    token.verify(payload, (result) => {
        return done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        env.get("/product?id=*", [input.body.product_id], (product) => {
            if (product.status == 1) {
                let total_price = product.data[0].price.actual * input.body.amount;
                let sql = "INSERT INTO orderitems (oitem_product_id, oitem_customer_id, oitem_amount, oitem_price) VALUES ?";
                let values = [[
                    input.body.product_id,
                    input.body.customer_id,
                    input.body.amount,
                    total_price
                ]];
            
                env.database.query(sql, [values], (err, result) => {
                    if (err) {
                        form.output.status = 0;
                        form.output.descript = "เกิดข้อผิดพลาดในการทำรายการ!";
                        form.output.error = err;
                        form.output.data = [];
            
                        return res.json(form.output);
                    }
            
                    if (result.affectedRows > 0) {
                        env.get("/order/item?id=*", [result.insertId], (item) => {
                            form.output.status = 1;
                            form.output.descript = "ทำรายการสำเร็จแล้ว!";
                            form.output.error = null;
                            form.output.data = item.data[0];
            
                            return res.json(form.output);
                        });
                    } else {
                        form.output.status = 0;
                        form.output.descript = "ทำรายการไม่สำเร็จ!";
                        form.output.error = err;
                        form.output.data = [];
            
                        return res.json(form.output);
                    }
                });
            } else {
                form.output = product;

                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.error = null;
        form.output.data = [];

        return res.json(form.output);
    }
});

module.exports = router;