const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (key == 'emp_imgURL') continue;
        if (key == 'emp_status') continue;

        if (val == null || val == '') {
            return {
                valid: false,
                message: 'กรุณากรอกข้อมูลให้ครบ'
            };
        }
    }

    if (body.emp_password != body.emp_repassword) {
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
        let sql = "INSERT INTO employees"
            + "(emp_username, emp_email, emp_name, emp_addr, emp_phone, emp_imgURL, emp_status, emp_password)"
            + "VALUES ?";

        let values = [[
            input.body.emp_username,
            input.body.emp_email,
            input.body.emp_name,
            input.body.emp_addr,
            input.body.emp_phone,
            input.body.emp_imgURL,
            input.body.emp_status,
            env.password_hash.generate(input.body.emp_password)
        ]];

        env.database.query(sql, [values], (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้ไปแล้ว';
                form.output.error.message = err.message

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                form.output.status = 1;
                form.output.descript = 'บันทึกข้อมูลสำเร็จแล้ว';
                form.output.data = {
                    emp_id: result.insertId,
                    emp_username: input.body.emp_username,
                    emp_email: input.body.emp_email,
                    emp_name: input.body.emp_name,
                    emp_addr: input.body.emp_addr,
                    emp_phone: input.body.emp_phone,
                    emp_imgURL: input.body.emp_imgURL,
                    emp_status: input.body.emp_status,
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