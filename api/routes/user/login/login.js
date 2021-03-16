const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (val == null || val == '') {
            return {
                valid: false,
                message: 'กรุณากรอกข้อมูลให้ครบ'
            };
        }
    }

    return {
        valid: true,
        message: 'ข้อมูลถูกต้อง'
    };
};

router.post('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = validate(input.body);

    if (vat.valid) {
        let sql = "SELECT cus_id, cus_name, cus_password FROM customers WHERE cus_email=?";

        env.database.query(sql, [input.body.cus_email], (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'เข้าสู่ระบบไม่สำเร็จ';
                form.output.error.message = err.message

                return res.json(form.output);
            }

            if (result.length == 1) {
                if (env.password_hash.verify(input.body.cus_password, result[0].cus_password)) {
                    form.output.status = 1;
                    form.output.descript = 'เข้าสู่ระบบสำเร็จแล้ว';
                    form.output.data = {
                        cus_id: result[0].cus_id,
                        cus_name: result[0].cus_name
                    };

                    return res.json(form.output);
                } else {
                    form.output.status = 0;
                    form.output.descript = 'รหัสผ่านไม่ถูกต้อง';

                    return res.json(form.output);
                }
            } else {
                form.output.status = 0;
                form.output.descript = 'ไม่พบที่อยู่อีเมลนี้';

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