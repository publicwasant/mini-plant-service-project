const express = require('express');
const router = express.Router();

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, ["id"]);

    if (vat.valid) {
        const sql = "UPDATE comments SET cm_text=? WHERE cm_id=?";
        const values = [
            input.body.text,
            input.body.id,
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get("/shop/comment?id=*", [input.body.id], (c) => {
                    form.output.status = 1;
                    form.output.descript = "ทำรายการสำเร็จแล้ว";
                    form.output.data = c.data[0];

                    return res.json(form.output);
                });
            } else {
                form.output.status = 0;
                form.output.descript = "ทำรายการไม่สำเร็จ!";
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