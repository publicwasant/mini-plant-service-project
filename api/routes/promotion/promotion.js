const express = require('express');
const router = express.Router();

const alternate = (param) => {
    const result = {
        sql: null,
        values: null
    };

    if (param.id) {
        result.sql = "SELECT * FROM promotions WHERE promo_id=? ORDER BY promo_id DESC";
        result.values = [param.id];
    } else if (param.product_id) {
        result.sql = "SELECT * FROM promotions "
            + "WHERE promo_id IN (SELECT pp_promotion_id "
                + "FROM promotions_related_to_products "
                + "WHERE pp_product_id=?) "
            + "ORDER BY promo_id DESC";
        result.values = [param.product_id];
    } else {
        result.sql = "SELECT * FROM promotions ORDER BY promo_id DESC";
        result.values = [];
    }

    return result;
};

const reorganize = (items, then) => {
    for (const [key, val] of Object.entries(items)) {
        items[key] = {
            id: val.promo_id,
            start: val.promo_start,
            end: val.promo_end,
            discount: val.promo_discount,
            detail: val.promo_details,
            images: JSON.parse(val.promo_imgURL)
        };
    }

    then(items);
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "พบข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = [];
            
            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(result, (items) => {
                form.output.status = 1;
                form.output.descript = "พบข้อมูลแล้ว " + items.length + " รายการ";
                form.output.data = items;

                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูล!";
            form.output.data = [];

            return res.json(form.output);
        }
    });
});

module.exports = router;