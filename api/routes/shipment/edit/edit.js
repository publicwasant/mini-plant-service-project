const express = require('express');
const router = express.Router();

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        let sql = "UPDATE shipments SET ship_date=?, ship_status=?, ship_bill=? WHERE ship_id=?";
        let values = [input.body.date, input.body.status, input.body.bill, input.body.id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get("/shipment?id=*", [input.body.id], (s) => {
                    form.output.status = 1;
                    form.output.descript = "แก้ไขข้อมูลสำเร็จแล้ว";
                    form.output.data = s.data[0];

                    return res.json(form.output);
                });
            } else {
                form.output.status = 0;
                form.output.descript = "แก้ไขข้อมูลไม่สำเร็จ!";
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