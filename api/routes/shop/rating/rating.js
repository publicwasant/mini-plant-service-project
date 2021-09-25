const express = require('express');
const router = express.Router();

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        if (input.body.rate >= 0 && input.body.rate <= 5) {
            const sql = "UPDATE customers SET cus_shoprated=? WHERE cus_id=?";
            const values = [input.body.rate, input.body.customer_id];

            env.database.query(sql, values, (err, result) => {
                if (err) {
                    form.output.status = 0;
                    form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                    form.output.error = err;
                    form.output.data = null;

                    return res.json(form.output);
                }

                if (result.affectedRows > 0) {
                    env.get("/user/customer?id=*", [input.body.customer_id], (c) => {
                        form.output.status = 1;
                        form.output.descript = "ทำรายการสำเร็จแล้ว";
                        form.output.data = c.data;

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
            form.output.descript = "ให้คะแนนได้ในช่วง 0-5 เท่านั้น!";
            form.output.data = null;

            return res.json(form.output);
        }
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.data = null;

        return res.json(form.output);
    }
});

module.exports = router;