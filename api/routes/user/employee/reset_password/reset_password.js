const express = require('express');
const router = express.Router();

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        let sql = "SELECT emp_password FROM employees WHERE emp_id=? AND emp_username=?";
        let values = [
            input.body.id,
            input.body.username
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                
                return res.json(form.output);
            }

            if (result.length > 0) {
                if (env.password_hash.verify(input.body.verify.my_password, result[0].emp_password)) {
                    let sqld = "UPDATE employees SET emp_password=? WHERE emp_id=?";
                    let valuesd = [
                        env.password_hash.generate(input.body.verify.new_password),
                        input.body.id
                    ];

                    env.database.query(sqld, valuesd, (err, result) => {
                        if (err) {
                            form.output.status = 0;
                            form.output.descript = "เปลี่ยนรหัสผ่านไม่สำเร็จ!";

                            return res.json(form.output);
                        }

                        if (result.affectedRows > 0) {
                            form.output.status = 1;
                            form.output.descript = "เปลี่ยนรหัสผ่านสำเร็จแล้ว";

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