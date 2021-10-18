const express = require('express');
const router = express.Router();

let alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM products WHERE pr_id=? ORDER BY pr_id DESC",
            values: [param.id]
        };
    } else if (param.key) {
        return {
            sql: "SELECT * FROM products WHERE pr_name LIKE ? OR pr_detail LIKE ? ORDER BY pr_id DESC",
            values: ["%" + param.key + "%", "%" + param.key + "%"]
        };
    } else {
        return {
            sql: "SELECT * FROM products ORDER BY pr_id DESC",
            values: [param.id]
        };
    }
};

const priceWithDiscountCalculate = (originalPrice, promotions) => {
    let discount = 0;

    if (promotions.status == 1) 
        for (let i=0; i < promotions.data.length; i++)
            discount += promotions.data[i].discount

    const difference = originalPrice * (discount/100);
    const actual = originalPrice - difference;

    return {
        original: originalPrice,
        actual: actual,
        discount: {
            percent: discount,
            difference: difference
        }
    };
};

const reorganize = (available, items, then) => {
    let finalOut = [];

    const fetch = (i) => {
        env.get({url: "/promotion?product_id=*&available=true", params: [items[i].pr_id], then: (p) => {
            const product = items[i];
            const temp = {
                id: product.pr_id,
                name: product.pr_name,
                detail: product.pr_detail,
                type: product.pr_type,
                status: product.pr_status,
                colors: product.pr_colors != null ? JSON.parse(product.pr_colors) : [],
                size: product.pr_size != null ? JSON.parse(product.pr_size) : [],
                images: product.pr_imgsURL != null ? JSON.parse(product.pr_imgsURL) : [],
                promotions: p.data,
                price: priceWithDiscountCalculate(product.pr_price, p)
            };

            if (available == 1) {
                if (temp.status != 0) {
                    finalOut.push(temp);
                }
            } else {
                finalOut.push(temp);
            }

            if (i + 1 < items.length) {
                fetch(i + 1);
            } else {
                then(finalOut);
            }
        }});
    };

    fetch(0);
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(input.url.available, result, (items) => {
                form.output.status = 1;
                form.output.descript = "พบข้อมูลแล้ว " + items.length + " รายการ";
                form.output.error = null;
                form.output.data = items;

                return res.json(form.output);
            });
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