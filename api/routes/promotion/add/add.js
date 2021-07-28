const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (key == 'promo_imgURL') continue;

        if (val == null || val == '') {
            return {
                valid: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ!'
            };
        }
    }

    return {
        valid: true,
        message: 'ข้อมูลถูกต้อง'
    };
};

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let vat = validate(input.body);

    if (vat.valid) {
        let sql = "INSERT INTO promotions "
            + "(promo_imgURL, promo_start, promo_end, promo_discount, promo_details) "
            + "VALUES ?";
        
        let values = [[
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
                form.output.error.message = err.message;
                
                return res.json(form.output);
            }

            let promo_id = result.insertId;
            let sqld = "UPDATE products SET pr_promo_id=? WHERE pr_id=?";
            let values = [promo_id, input.body.product_id];

            env.database.query(sqld, values, (err, result) => {
                if (err) {
                    form.output.status = 0;
                    form.output.descript = "บันทึกข้อมูลไม่สำเร็จ!";
                    form.output.error.message = err.message;
                    
                    return res.json(form.output);
                }

                form.output.status = 1;
                form.output.descript = "บันทึกข้อมูลสำเร็จแล้ว";
                form.output.data = {
                    product_id: input.body.product_id,
                    promo_id: promo_id,
                    promo_start: input.body.promo_start,
                    promo_end: input.body.promo_end,
                    promo_discount: input.body.promo_discount,
                    promo_detail: input.body.promo_details,
                    promo_imgURL: input.body.promo_imgURL == null ? [] : input.body.promo_imgURL
                };

                return res.json(form.output);
            });
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;

        return res.json(form.output);
    }
});

module.exports = router;