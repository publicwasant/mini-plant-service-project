const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, ["cus_imgURL"]);

    if (vat.valid) {
        if (input.body.password == input.body.retype_password) {
            const sql = "INSERT INTO customers"
                + "(cus_email, cus_name, cus_addr, cus_phone, cus_imgURL, cus_password)"
                + "VALUES ?";

            const values = [[
                input.body.email,
                input.body.name,
                input.body.addr,
                input.body.phone,
                input.body.image,
                env.password_hash.generate(input.body.password)
            ]];

            env.database.query(sql, [values], (err, result) => {
                if (err) {
                    form.output.status = 0;
                    form.output.descript = 'อีเมลนี้ถูกใช้ไปแล้ว';
                    form.output.error = err;
                    form.output.data = [];

                    return res.json(form.output);
                }

                if (result.affectedRows > 0) {
                    token.generate(1, result.insertId, (token) => {
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