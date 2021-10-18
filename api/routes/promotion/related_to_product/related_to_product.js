const express = require('express');
const router = express.Router();

const reorganize = (items) => {
    const products_id = [];

    for (const [key, val] of Object.entries(items)) {
        products_id.push(val.pp_product_id);
    }

    return products_id;
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const sql = "SELECT pp_product_id FROM promotions_related_to_products WHERE pp_promotion_id=?";
    const values = [input.url.promotion_id];

    env.database.query(sql, values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = null;

            return res.json(form.output);
        }

        if (result.length > 0) {
            form.output.status = 1;
            form.output.descript = "พบข้อมูลแล้ว " + result.length + " รายการ";
            form.output.data = reorganize(result);

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูล!";
            form.output.data = null;

            return res.json(form.output);
        }
    });
});

module.exports = router;