const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.post('/', token.auth((payload, done) => {
    token.verify(payload, (result) => {
        return done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, ["previous_id", "employee_id", "customer_id"]);

    if (vat.valid) {
        const sql = "INSERT INTO comments (cm_previous_id, cm_emp_id, cm_cus_id, cm_text) VALUES ?";
        const values = [[[
            input.body.previous_id,
            input.body.employee_id,
            input.body.customer_id,
            input.body.text
        ]]];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get("/shop/comment?id=*", [result.insertId], (c) => {
                    form.output.status = 1;
                    form.output.descript = "ทำรายการสำเร็จแล้ว";
                    form.output.data = c.data[0];

                    return res.json(form.output);
                });
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