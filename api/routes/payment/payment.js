const express = require('express');
const router = express.Router();

const alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM payments WHERE pay_id=?",
            values: [param.id]
        };
    } else if (param.order_id) {
        return {
            sql: "SELECT * FROM payments WHERE pay_order_id=?",
            values: [param.order_id]
        };
    } else {
        return {
            sql: "SELECT * FROM payments",
            values: []
        };
    }
};

const reorganize = (items) => {
    for (let [key, val] of Object.entries(items)) {
        items[key] = {
            id: val.pay_id,
            order_id: val.pay_order_id,
            date: val.pay_date,
            status: val.pay_status
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