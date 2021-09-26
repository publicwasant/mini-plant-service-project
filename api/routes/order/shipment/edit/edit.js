const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.put('/', token.auth((payload, done) => {
    if (payload.status != 0)
        return done(null, false);

    token.verify(payload, (result) => {
        return done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        let sql = "UPDATE orders SET ship_bill=?, ship_status=? WHERE order_id=?";
        let values = [input.body.bill, input.body.status, input.body.id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get("/order?id=*", [input.body.id], (s) => {
                    form.output.status = 1;
                    form.output.descript = "แก้ไขข้อมูลสำเร็จแล้ว";
                    form.output.data = s.data[0];

                    return res.json(form.output);
                });
            } else {
                form.output.status = 0;
                form.output.descript = "แก้ไขข้อมูลไม่สำเร็จ!";
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