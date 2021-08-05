const express = require('express');
const router = express.Router();

router.put('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        let sql = "UPDATE customers SET cus_email=?, cus_name=?, cus_addr=?, cus_phone=?, cus_imgURL=? WHERE cus_id=?";
        let values = [
            input.body.email,
            input.body.name,
            input.body.addr,
            input.body.phone,
            input.body.image,
            input.body.id
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'ไม่สามารถแก้ไขข้อมูลได้';
                form.output.error = err;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get("/user/customer?id=*", [input.body.id], (c) => {
                    form.output.status = 1;
                    form.output.descript = 'แก้ไขข้อมูลสำเร็จแล้ว';
                    form.output.data = c.data[0];

                    return res.json(form.output);
                });
            } else {
                form.output.status = 0;
                form.output.descript = 'แก้ไขข้อมูลไม่สำเร็จ';
                form.output.data = [];
                
                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.data = [];

        return res.json(form.output);
    }
});

module.exports = router;