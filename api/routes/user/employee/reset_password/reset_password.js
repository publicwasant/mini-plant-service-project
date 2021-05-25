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

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = validate(input.body);

    if (vat.valid) {
        let sql = "SELECT emp_password FROM employees WHERE emp_id=? AND emp_username=?";
        let values = [
            input.body.emp_id,
            input.body.emp_username
        ];

        env.database.query(sql, values, (err, result) => {
            if (result.length == 1) {
                if (env.password_hash.verify(input.body.emp_old_password, result[0].emp_password)) {
                    let rsql = "UPDATE employees SET emp_password=? WHERE emp_id=?";
                    let rvalues = [
                        env.password_hash.generate(input.body.emp_new_password),
                        input.body.emp_id
                    ];

                    env.database.query(rsql, rvalues, (err, result) => {
                        if (err) {
                            form.output.status = 0;
                            form.output.descript = "เปลี่ยนรหัสผ่านไม่สำเร็จ!";

                            return res.json(form.output);
                        }

                        if (result.affectedRows > 0) {
                            form.output.status = 1;
                            form.output.descript = "เปลี่ยนรหัสผ่านสำเร็จแล้ว";
                            form.output.data.cus_id = input.body.emp_id;
                            form.output.data.cus_email = input.body.emp_email;

                            return res.json(form.output);
                        } else {
                            form.output.status = 0;
                            form.output.descript = "เปลี่ยนรหัสผ่านไม่สำเร็จ!";

                            return res.json(form.output);
                        }
                    });
                } else {
                    form.output.status = 0;
                    form.output.descript = "รหัสผ่านไม่ถูก!";

                    return res.json(form.output);
                }
            } else {
                form.output.status = 0;
                form.output.descript = "ไม่พบผู้ใช้!";

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