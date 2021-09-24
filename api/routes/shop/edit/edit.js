const express = require('express');
const router = express.Router();

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const sql = "UPDATE shops SET "
        + "shop_email=?, "
        + "shop_phone=?, "
        + "shop_imgsURL=?, "
        + "shop_bk_name=?, "
        + "shop_bk_owner=?, "
        + "shop_bk_number=?, "
        + "shop_bk_prompay=? "
        + "WHERE shop_id=0"

    const values = [
        input.body.shop.email,
        input.body.shop.phone,
        JSON.stringify(
            input.body.shop.images == null ? 
            [] : input.body.shop.images),
        input.body.bank.name,
        input.body.bank.owner,
        input.body.bank.number,
        input.body.bank.prompay
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
            env.get("/shop", [], (s) => {
                form.output.status = 1;
                form.output.descript = "ทำรายการสำเร็จแล้ว";
                form.output.error = null;
                form.output.data = s.data;

                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = "ทำรายการไม่สำเร็จ!";
            form.output.data = []

            return res.json(form.output);
        }
    });
});

module.exports = router;