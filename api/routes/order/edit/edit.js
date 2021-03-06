const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

router.put('/', token.auth((payload, done) => {
    token.verify(payload, (result) => {
        return done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, ["type", "customer_id", "employee_id"]);
    
    if (vat.valid) {
        const sql = "UPDATE orders SET order_type=?, cus_id=?, emp_id=? WHERE order_id=?";
        const values = [input.body.type, input.body.customer_id, input.body.employee_id, input.body.id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;
                
                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get({token: input.header.authorization, url: "/order?id=*", params: [input.body.id], then: (order) => {
                    form.output.status = 1;
                    form.output.descript = "ทำรายการสำเร็จแล้ว";
                    form.output.data = order.data;

                    return res.json(form.output);
                }});
            } else {
                form.output.status = 0;
                form.output.descript = "ทำรายการไม่สำเร็จ!";
                form.output.data = null;

                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.data = null;
        
        return res.json(form.output);
    }
});

module.exports = router;