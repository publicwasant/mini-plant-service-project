const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.put('/', token.auth((payload, done) => {
    payload.status == 1 ?
        token.verify(payload, (result) => {
            done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        const sql = "UPDATE orders SET pay_date=?, pay_transfer=?, pay_status=? WHERE order_id=?";
        const values = [
            input.body.date,
            input.body.transfer, 
            input.body.status, 
            input.body.id
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get({token: input.header.authorization, url: "/order?id=*", params: [input.body.id], then: (p) => {
                    form.output.status = 1;
                    form.output.descript = "ทำรายการสำเร็จแล้ว";
                    form.output.data = p.data[0];

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