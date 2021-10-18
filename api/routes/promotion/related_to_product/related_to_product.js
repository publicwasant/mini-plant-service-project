const express = require('express');
const router = express.Router();

const reorganize = (items) => {
    for (let i=0; i<items.length; i++) {
        items[i] = {
            id: items[i].pr_id,
            name: items[i].pr_name,
            detail: items[i].pr_detail,
            type: items[i].pr_type,
            status: items[i].pr_status,
            colors: items[i].pr_colors != null ? JSON.parse(items[i].pr_colors) : [],
            size: items[i].pr_size != null ? JSON.parse(items[i].pr_size) : [],
            images: items[i].pr_imgsURL != null ? JSON.parse(items[i].pr_imgsURL) : [],
            price: items[i].pr_price
        };
    }

    return items;
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const sql = "SELECT * FROM products WHERE pr_id IN (SELECT pp_product_id FROM promotions_related_to_products WHERE pp_promotion_id=?)";
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