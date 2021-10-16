const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.post('/', token.auth((payload, done) => {
    payload.status == 0 ?
        token.verify(payload, (result) => {
        done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        const sql = "INSERT INTO banks (bk_name, bk_owner, bk_number, bk_prompay) VALUES ?";
        const values = [[[input.body.name, input.body.owner, input.body.number, input.body.prompay]]];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;
        
                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get({url: "/shop/bank?id=*", params: [result.insertId], then: (bank) => {
                    form.output.status = 1;
                    form.output.descript = "บันทึกข้อมูลสำเร็จแล้ว";
                    form.output.data = bank.data[0];

                    return res.json(form.output);
                }})
            } else {
                form.output.status = 0;
                form.output.descript = "บันทึกข้อมูลไม่สำเร็จ!";
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