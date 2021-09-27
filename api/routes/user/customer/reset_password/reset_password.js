const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.put('/', token.auth((payload, done) => {
    payload.status == 1 ?
        token.verify(payload, (result) => {
            done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        const sql = "SELECT cus_password FROM customers WHERE cus_id=? AND cus_email=?";
        const values = [input.body.id, input.body.email];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                
                return res.json(form.output);
            }

            if (result.length > 0) {
                if (env.password_hash.verify(input.body.verify.my_password, result[0].cus_password)) {
                    const sqld = "UPDATE customers SET cus_password=? WHERE cus_id=?";
                    const valuesd = [
                        env.password_hash.generate(input.body.verify.new_password),
                        input.body.id
                    ];

                    env.database.query(sqld, valuesd, (err, result) => {
                        if (err) {
                            form.output.status = 0;
                            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                            form.output.error = err;
                            
                            return res.json(form.output);
                        }

                        if (result.affectedRows > 0) {
                            form.output.status = 1;
                            form.output.descript = "แก้ไขข้อมูลสำเร็จ";
                            
                            return res.json(form.output);
                        } else {
                            form.output.status = 0;
                            form.output.descript = "แก้ไขรหัสผ่านไม่สำเร็จ!";
                            
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
                form.output.descript = "ไม่พบข้อมูลลูกค้า!";
                form.output.error = err;

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