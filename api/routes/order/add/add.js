const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let sql = "INSERT INTO orders (order_type, order_date, order_totalPrice, cus_id, emp_id) VALUES ?";
    let values = [[
        input.body.order_type,
        input.body.order_date,
        input.body.order_totalPrice,
        input.body.cus_id,
        input.body.emp_id
    ]];

    env.database.query(sql, [values], (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = 'ไม่สามารถทำรายการได้';
            form.output.error.message = err.message;

            return res.json(form.output);
        }

        if (result.affectedRows > 0) {
            form.output.status = 1;
            form.output.descript = 'ทำรายการสำเสร็จแล้ว';
            form.output.data = {
                order_id: result.insertId,
                order_type: input.body.order_type,
                order_date: input.body.order_date,
                order_totalPrice: input.body.order_totalPrice,
                cus_id: input.body.cus_id,
                emp_id: input.body.emp_id
            };

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = 'ทำรายการไม่สำเสร็จ';

            return res.json(form.output);
        }
    });
});

module.exports = router;