const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let sql = "INSERT INTO orderdetails (pr_id, pr_amount, pr_price, order_id) VALUES ?";
    let values = [[
        input.body.pr_id,
        input.body.pr_amount,
        input.body.pr_price,
        input.body.order_id
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
                od_id: result.insertId,
                pr_id: input.body.pr_id,
                pr_amount: input.body.pr_amount,
                pr_price: input.body.pr_price,
                order_id: input.body.order_id
            };

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = 'ทำรายการไม่สำเสร็จ';

            return res.json(form.output);
        }
    });

    // return res.json(form.output);
});

module.exports = router;