const express = require('express');
const router = express.Router();

let alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM products "
                +"LEFT JOIN promotions ON products.pr_promo_id=promotions.promo_id "
                + "WHERE products.pr_id=? ORDER BY products.pr_id DESC",
            values: [param.id]
        };
    } else if (param.key) {
        return {
            sql: "SELECT * FROM products "
                +"LEFT JOIN promotions ON products.pr_promo_id=promotions.promo_id "
                + "WHERE products.pr_name LIKE ? OR products.pr_detail LIKE ? ORDER BY products.pr_id DESC",
            values: ["%" + param.key + "%", "%" + param.key + "%"]
        };
    } else {
        return {
            sql: "SELECT * FROM products "
                +"LEFT JOIN promotions ON products.pr_promo_id=promotions.promo_id "
                + "ORDER BY products.pr_id DESC",
            values: [param.id]
        };
    }
};

let reorganize = (items) => {
    for (let [key, val] of Object.entries(items)) {
        let percent = val.promo_discount != null ? val.promo_discount/100 : 0;
        let difference = val.pr_price * percent;
        let actual = val.pr_price - difference;

        items[key] = {
            id: val.pr_id,
            name: val.pr_name,
            detail: val.pr_detail,
            type: val.pr_type,
            status: val.pr_status,
            size: val.pr_size != null ? JSON.parse(val.pr_size) : [],
            images: val.pr_imgsURL != null ? JSON.parse(val.pr_imgsURL) : [],
            promotion: val.promo_id != null ? {
                id: val.promo_id,
                detail: val.promo_details,
                discount: val.promo_discount,
                start: val.promo_start,
                end: val.promo_end,
                images: val.promo_imgURL != null ? JSON.parse(val.promo_imgURL) : []
            } : null,
            price: {
                original: val.pr_price,
                actual: actual,
                discount: {
                    percent: percent * 100,
                    difference: difference
                }
            }
        };
    }

    return items;
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error.message = err;
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            form.output.status = 1;
            form.output.descript = "พบข้อมูลแล้ว " + result.length + " รายการ";
            form.output.error = null;
            form.output.data = reorganize(result);;

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูล!";
            form.output.error = null;
            form.output.data = [];

            return res.json(form.output);
        }
    });
});

module.exports = router;