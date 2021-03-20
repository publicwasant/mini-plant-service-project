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

router.put('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = validate(input.body);

    if (vat.valid) {
        let sql = "UPDATE customers SET cus_email=?, cus_name=?, cus_addr=?, cus_phone=?, cus_imgURL=? WHERE cus_id=?";
        let values = [
            input.body.cus_email,
            input.body.cus_name,
            input.body.cus_addr,
            input.body.cus_phone,
            input.body.cus_imgURL,
            input.body.cus_id
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
                    cus_id: input.body.cus_id,
                    cus_email: input.body.cus_email,
                    cus_name: input.body.cus_name,
                    cus_addr: input.body.cus_addr,
                    cus_phone: input.body.cus_phone,
                    cus_imgURL: input.body.cus_imgURL
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