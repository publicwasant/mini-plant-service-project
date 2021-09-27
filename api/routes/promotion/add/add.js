const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

router.post('/', token.auth((payload, done) => {
    payload.status == 0 ? 
        token.verify(payload, (result) => {
            done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, ["promo_imgURL"]);

    if (vat.valid) {
        const sql = "INSERT INTO promotions "
            + "(promo_imgURL, promo_start, promo_end, promo_discount, promo_details) "
            + "VALUES ?";
        
        const values = [[
            JSON.stringify(input.body.promo_imgURL == null ? [] : input.body.promo_imgURL),
            input.body.promo_start,
            input.body.promo_end,
            input.body.promo_discount,
            input.body.promo_details
        ]];

        env.database.query(sql, [values], (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "บันทึกข้อมูลไม่สำเร็จ!";
                form.output.error = err;
                form.output.data = [];
                
                return res.json(form.output);
            }

            const promo_id = result.insertId;
            const sqld = "UPDATE products SET pr_promo_id=? WHERE pr_id=?";
            const values = [promo_id, input.body.product_id];

            env.database.query(sqld, values, (err, result) => {
                if (err) {
                    form.output.status = 0;
                    form.output.descript = "บันทึกข้อมูลไม่สำเร็จ!";
                    form.output.error = err;
                    form.output.data = [];
                    
                    return res.json(form.output);
                }

                if (result.affectedRows > 0) {
                    env.get({url: "/promotion?id=*", params: [promo_id], then: (p) => {
                        form.output.status = 1;
                        form.output.descript = "บันทึกข้อมูลสำเร็จแล้ว";
                        form.output.error = null;
                        form.output.data = p.data[0];
    
                        return res.json(form.output);
                    }});
                } else {
                    form.output.status = 0;
                    form.output.descript = "บันทึกข้อมูลไม่สำเร็จ!";
                    form.output.error = null;
                    form.output.data = [];
                    
                    return res.json(form.output);
                }
            });
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.error = null;
        form.output.data = [];

        return res.json(form.output);
    }
});

module.exports = router;