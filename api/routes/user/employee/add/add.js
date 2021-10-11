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

    const vat = env.validate(input.body, ["image"]);

    if (vat.valid) {
        if (input.body.password == input.body.retype_password) {
            const sql = "INSERT INTO employees"
                + "(emp_username, emp_email, emp_name, emp_addr, emp_phone, emp_imgURL, emp_status, emp_password)"
                + "VALUES ?";

            const values = [[
                input.body.username,
                input.body.email,
                input.body.name,
                input.body.addr,
                input.body.phone,
                input.body.image,
                input.body.status,
                env.password_hash.generate(input.body.password)
            ]];

            env.database.query(sql, [values], (err, result) => {
                if (err) {
                    form.output.status = 0;
                    form.output.descript = 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้ไปแล้ว';
                    form.output.error = err;
                    form.output.data = [];

                    return res.json(form.output);
                }

                if (result.affectedRows > 0) {
                    token.generate(0, result.insertId, (token) => {
                        form.output.status = 1;
                        form.output.descript = 'บันทึกข้อมูลสำเร็จแล้ว';
                        form.output.data = {
                            token: token
                        };
                        
                        return res.json(form.output);
                    });
                } else {
                    form.output.status = 0;
                    form.output.descript = 'บันทึกข้อมูลไม่สำเร็จ';
                    form.output.data = [];

                    return res.json(form.output);
                }
            });
       } else {
            form.output.status = 0;
            form.output.descript = 'กรุณากรอกรหัสผ่านให้ตรงกัน!';
            form.output.data = [];

            return res.json(form.output);
       }
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.data = [];

        return res.json(form.output);
    }
});

module.exports = router;