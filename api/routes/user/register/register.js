const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (key == 'cus_imgURL') continue;

        if (val == null || val == '') {
            return {
                valid: false,
                message: 'กรุณากรอกข้อมูลให้ครบ'
            };
        }
    }

    if (body.cus_password != body.cus_repassword) {
        return {
            valid: false,
            message: 'ยืนยันรหัสผ่านให้ถูกต้อง'
        };
    }

    return {
        valid: true,
        message: 'ข้อมูลถูกต้อง'
    };
};

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = validate(input.body)

    if (vat.valid) {
        let sql = "INSERT INTO customers"
            + "(cus_email, cus_name, cus_addr, cus_phone, cus_imgURL, cus_password)"
            + "VALUES ?";

        let values = [[
            input.body.cus_email,
            input.body.cus_name,
            input.body.cus_addr,
            input.body.cus_phone,
            input.body.cus_imgURL,
            env.password_hash.generate(input.body.cus_password)
        ]];

        env.database.query(sql, [values], (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'อีเมลนี้ถูกใช้ไปแล้ว';
                form.output.error.message = err.message

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                form.output.status = 1;
                form.output.descript = 'บันทึกข้อมูลสำเร็จแล้ว';
                form.output.data = {
                    cus_id: result.insertId,
                    cus_email: input.body.cus_email,
                    cus_name: input.body.cus_name,
                    cus_addr: input.body.cus_addr,
                    cus_phone: input.body.cus_phone,
                    cus_imgURL: input.body.cus_imgURL,
                };
                
                return res.json(form.output);
            } else {
                form.output.status = 0;
                form.output.descript = 'บันทึกข้อมูลไม่สำเร็จ';

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