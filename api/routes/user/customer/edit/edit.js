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
        const sql = "UPDATE customers SET cus_email=?, cus_name=?, cus_addr=?, cus_phone=?, cus_imgURL=?, cus_status=? WHERE cus_id=?";
        const values = [
            input.body.email,
            input.body.name,
            input.body.addr,
            input.body.phone,
            input.body.image,
            input.body.status,
            input.body.id
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'ไม่สามารถแก้ไขข้อมูลได้';
                form.output.error = err;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get({url: "/user/customer?id=*", params: [input.body.id], then: (c) => {
                    form.output.status = 1;
                    form.output.descript = 'แก้ไขข้อมูลสำเร็จแล้ว';
                    form.output.data = c.data[0];

                    return res.json(form.output);
                }});
            } else {
                form.output.status = 0;
                form.output.descript = 'แก้ไขข้อมูลไม่สำเร็จ';
                form.output.data = [];
                
                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.data = [];

        return res.json(form.output);
    }
});

module.exports = router;