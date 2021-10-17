const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

router.put('/', token.auth((payload, done) => {
    payload.status == 0 ?
        token.verify(payload, (result) => {
        done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const sql = "UPDATE shops SET "
        + "shop_email=?, "
        + "shop_phone=?, "
        + "shop_owner=?, "
        + "shop_addr=?, "
        + "shop_imgsURL=? "
        + "WHERE shop_id=0"

    const values = [
        input.body.email,
        input.body.phone,
        input.body.owner,
        input.body.addr,
        JSON.stringify(
            input.body.images == null ? 
            [] : input.body.images),
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
            env.get({url: "/shop", params: [], then: (s) => {
                form.output.status = 1;
                form.output.descript = "ทำรายการสำเร็จแล้ว";
                form.output.error = null;
                form.output.data = s.data;

                return res.json(form.output);
            }});
        } else {
            form.output.status = 0;
            form.output.descript = "ทำรายการไม่สำเร็จ!";
            form.output.data = []

            return res.json(form.output);
        }
    });
});

module.exports = router;