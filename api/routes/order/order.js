const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let sql;
    let values;

    if (input.url.id) {
        sql = "SELECT * FROM orders WHERE order_id=?";
        values = [input.url.id];
    } else if (input.url.cus_id) {
        sql = "SELECT * FROM orders WHERE cus_id=?";
        values = [input.url.cus_id];
    } else {
        sql = "SELECT * FROM orders";
        values = [];
    }

    env.database.query(sql, values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = 'ไม่าสามารถทำรายการได้';
            form.output.error.message = err.message;

            return res.json(form.output);
        }

        if (result.length > 0) {
            form.output.status = 1;
            form.output.descript = 'พบข้อมูลแล้ว ' + result.length + ' รายการ';
            form.output.data = result;

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = 'ไม่พบข้อมูล';
            form.output.data = [];

            return res.json(form.output);
        }
    });
});

module.exports = router;