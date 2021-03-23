const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (key == 'emp_status') continue;

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

router.put('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = validate(input.body);

    if (vat.valid) {
        let sql = "UPDATE employees SET emp_username=?, emp_email=?, emp_name=?, emp_addr=?, emp_phone=?, emp_imgURL=?, emp_status=? WHERE emp_id=?";
        let values = [
            input.body.emp_username,
            input.body.emp_email,
            input.body.emp_name,
            input.body.emp_addr,
            input.body.emp_phone,
            input.body.emp_imgURL,
            input.body.emp_status,
            input.body.emp_id
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'ไม่สามารถแก้ไขข้อมูลได้';
                form.output.error.message = err.message;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                form.output.status = 1;
                form.output.descript = 'แก้ไขข้อมูลสำเร็จแล้ว';
                form.output.data = {
                    emp_id: input.body.emp_id,
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
                form.output.descript = 'แก้ไขข้อมูลไม่สำเร็จ';
                
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