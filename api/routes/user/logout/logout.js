const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

router.post('/', token.auth((payload, done) => {
    token.verify(payload, (result) => {
        return done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        token.deny(input.body.status, input.body.id, (result) => {
            if (result) {
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