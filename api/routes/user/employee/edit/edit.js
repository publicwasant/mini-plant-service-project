const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.put('/', token.auth((payload, done) => {
    payload.status == 0 ?
        token.verify(payload, (result) => {
            done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);
    
    const vat = env.validate(input.body, []);

    if (vat.valid) {
        let sql = "UPDATE employees SET emp_username=?, emp_email=?, emp_name=?, emp_addr=?, emp_phone=?, emp_imgURL=?, emp_status=? WHERE emp_id=?";
        let values = [
            input.body.username,
            input.body.email,
            input.body.name,
            input.body.addr,
            input.body.emp_phone,
            input.body.image,
            input.body.status,
            input.body.id
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'ไม่สามารถแก้ไขข้อมูลได้';
                form.output.error = err;
                form.output.data = [];

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get({url: "/user/employee?id=*", params: [input.body.id], then: (e) => {
                    form.output.status = 1;
                    form.output.descript = 'แก้ไขข้อมูลสำเร็จแล้ว';
                    form.output.data = e.data[0];

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