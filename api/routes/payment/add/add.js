const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        let sql = "INSERT INTO payments (pay_order_id, pay_date, pay_status) VALUES ?";
        let values = [[[input.body.order_id, env.date().current, 1]]];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get("/payment?id=*", [result.insertId], (p) => {
                    form.output.status = 1;
                    form.output.descript = "ทำรายการสำเสร็จแล้ว";
                    form.output.data = p.data[0];

                    return res.json(form.output);
                });
            } else {
                form.output.status = 0;
                form.output.descript = "ทำรายการไม่สำเสร็จ!";
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