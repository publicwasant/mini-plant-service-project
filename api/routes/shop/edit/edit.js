const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (key == 'shop_imgs') continue;
        if (key == 'shop_bk_name') continue;
        if (key == 'shop_bk_owner') continue;
        if (key == 'shop_bk_number') continue;
        if (key == 'shop_bk_promptpay') continue;

        if (val == null || val == '') {
            return {
                valid: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ'
            };
        }
    }

    return {
        valid: true,
        message: 'ข้อมูลถูกต้อง'
    };
};

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let vat = validate(input.body);
    
    if (vat.valid) {
        let sql = "UPDATE shop SET "
            + "shop_name=?, " 
            + "shop_emp_id=?, "
            + "shop_imgs=?, "
            + "shop_addr=?, "
            + "shop_email=?, "
            + "shop_phone=?, "
            + "shop_bk_name=?, "
            + "shop_bk_owner=?, "
            + "shop_bk_number=?, "
            + "shop_bk_promptpay=? "
            + "WHERE shop_id=?";

        let values = [
            input.body.shop_name,
            input.body.shop_emp_id,
            input.body.shop_imgs,
            input.body.shop_addr,
            input.body.shop_email,
            input.body.shop_phone,
            input.body.shop_bk_name,
            input.body.shop_bk_owner,
            input.body.shop_bk_number,
            input.body.shop_bk_promptpay,
            input.body.shop_id
        ];

        env.database.query(sql, values, (err, result) => {
            if (!err && result.affectedRows > 0) {
                form.output.status = 1;
                form.output.descript = "แก้ไขข้อมูลสำเร็จแล้ว";
                form.output.data = input.body;

                return res.json(form.output);
            } else {
                form.output.status = 0;
                form.output.descript = "แก้ไขข้อมูลไม่สำเร็จ!";
                form.output.error.message = err;

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