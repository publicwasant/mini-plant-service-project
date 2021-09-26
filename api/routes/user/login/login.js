const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

const validate = (body) => {
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

const classifier = (body, then) => {

    const sql_customer = "SELECT cus_id, cus_password FROM customers WHERE cus_email=?";
    const sql_employee = "SELECT emp_id, emp_password FROM employees WHERE emp_username=?";

    const value = [body.username];

    env.database.query(sql_customer, value, (err, result) => {
        if (result.length == 1) {
            return then({
                user_status: 1,
                id: result[0]['cus_id'],
                password: result[0]['cus_password']
            });
        } else {
            env.database.query(sql_employee, value, (err, result) => {
                if (result.length == 1) {
                    return then({
                        user_status: 0,
                        id: result[0]['emp_id'],
                        password: result[0]['emp_password']
                    });
                } else {
                    return then(null);
                }
            });
        }
    });
};

router.post('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = validate(input.body);

    if (vat.valid) {
        classifier(input.body, (result) => {
            if (result != null) {
                if (env.password_hash.verify(input.body.password, result.password)) {
                    token.generate(result.user_status, result.id, (key) => {
                        form.output.status = 1;
                        form.output.descript = 'เข้าสู่ระบบสำเร็จแล้ว';
                        form.output.data = {token: key};

                        return res.json(form.output);
                    });
                } else {
                    form.output.status = 0;
                    form.output.descript = 'รหัสผ่านไม่ถูกต้อง';

                    return res.json(form.output);
                }
            } else {
                form.output.status = 0;
                form.output.descript = 'ไม่พบผู้ใช้';

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