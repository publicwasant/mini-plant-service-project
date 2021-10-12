const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.post('/', token.auth((payload, done) => {
    payload.status == 0 ? 
        token.verify(payload, (result) => {
            done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        const sql = "INSERT INTO promotions_related_to_products (pp_product_id, pp_promotion_id) VALUES ?";
        const values = [[[input.body.product_id, input.body.promotion_id]]];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error = err;
                form.output.data = null;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                env.get({url: "/product?id=*", params: [input.body.product_id], then: (p) => {
                    form.output.status = 1;
                    form.output.descript = "บันทึกข้อมูสำเร็จแล้ว";
                    form.output.error = null;
                    form.output.data = p.data[0];

                    return res.json(form.output);
                }});
            } else {
                form.output.status = 0;
                form.output.descript = "บันทึกข้อมูไม่สำเร็จ!";
                form.data = null;

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