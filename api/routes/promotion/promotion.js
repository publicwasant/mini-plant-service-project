const express = require('express');
const router = express.Router();

const alternate = (param) => {
    const result = {
        sql: null,
        values: null
    };

    if (param.id) {
        result.sql = "SELECT * FROM promotions WHERE promo_id=?";
        result.values = [param.id];
    } else if (param.product_id) {
        result.sql = "SELECT * FROM promotions "
            + "WHERE promo_id=(SELECT pr_promo_id FROM products WHERE pr_id=?)";
        result.values = [param.product_id];
    } else {
        result.sql = "SELECT * FROM promotions ORDER BY promo_id DESC";
        result.values = [];
    }

    return result;
};

const reorganize = (items) => {
    for (const [key, val] of Object.entries(items)) {
        items[key] = {
            id: val.promo_id,
            detail: val.promo_details,
            discount: val.promo_discount,
            start: val.promo_start,
            end: val.promo_end,
            images: JSON.parse(val.promo_imgURL)
        };
    }

    return items;
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "พบข้อผิดพลาดบางอย่าง!";
            form.output.error.message = err;
            
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

            return res.json(form.output);
        }
    });
});

module.exports = router;