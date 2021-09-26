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

    let vat = env.validate(input.body, []);

    if (vat.valid) {
        let sql = "DELETE FROM orderitems WHERE oitem_id=?";
        let values = [input.body.id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                form.output.status = 1;
                form.output.descript = "ทำรายการสำเร็จแล้ว";

                return res.json(form.output);
            } else {
                form.output.status = 0;
                form.output.descript = "ทำรายการไม่สำเร็จ!";

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