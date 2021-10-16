const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.put('/',  token.auth((payload, done) => {
    payload.status == 0 ?
        token.verify(payload, (result) => {
        done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        const sql = "UPDATE banks SET bk_name=?, bk_owner=?, bk_number=?, bk_prompay=? WHERE bk_id=?";
        const values = [input.body.name, input.body.owner, input.body.number, input.body.prompay, input.body.id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;
        
                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get({url: "/shop/bank?id=*", params: [input.body.id], then: (bank) => {
                    form.output.status = 1;
                    form.output.descript = "แก้ไขข้อมูลสำเร็จแล้ว";
                    form.output.data = bank.data[0];

                    return res.json(form.output);
                }})
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