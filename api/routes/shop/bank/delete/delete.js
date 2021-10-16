const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.post('/',  token.auth((payload, done) => {
    payload.status == 0 ?
        token.verify(payload, (result) => {
        done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        const sql = "DELETE FROM banks WHERE bk_id=?";
        const values = [input.body.id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                
                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                form.output.status = 0;
                form.output.descript = "ลบข้อมูลสำเร็จแล้ว";

                return res.json(form.output);
            } else {
                form.output.status = 0;
                form.output.descript = "ลบข้อมูลไม่สำเร็จ!";

                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;

        return res.json(form.output);
    }
});

module.exports = router;