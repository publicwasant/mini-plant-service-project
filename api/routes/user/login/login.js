const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

const get = (key, then) => {
    const sqlc = "SELECT cus_id, cus_password FROM customers WHERE cus_email=? AND cus_status!=0";
    const sqle = "SELECT emp_id, emp_password FROM employees WHERE emp_username=? AND emp_status!=0";
    const values = [key];

    return env.database.query(sqlc, values, (err, result) => {
        return result.length > 0 ? then({
            status: 1,
            id: result[0].cus_id,
            password: result[0].cus_password
        }) : env.database.query(sqle, values, (err, result) => {
            return result.length > 0 ? then({
                status: 0,
                id: result[0].emp_id,
                password: result[0].emp_password
            }) : then(null);
        });
    });
};

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        return get(input.body.username, (sub) => {
            if (sub) {
                if (env.password_hash.verify(input.body.password, sub.password)) {
                    return token.generate(sub.status, sub.id, (token) => {
                        form.output.status = 1;
                        form.output.descript = 'เข้าสู่ระบบสำเร็จแล้ว';
                        form.output.data = {token: token};

                        return res.json(form.output);
                    });
                } else {
                    form.output.status = 0;
                    form.output.descript = "รหัสผ่านไม่ถูกต้อง!";
                    form.output.data = null;
                    
                    return res.json(form.output);
                }
            } else {
                form.output.status = 0;
                form.output.descript = "ไม่พบข้อมูลผู้ใช้!";
                form.output.data = null;
                
                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.data = null;
        
        return res.json(form.output);
    }
});

module.exports = router;