const express = require('express');
const app = require('../../../../app');
const router = express.Router();
router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let sqlNullOrder = "SELECT od_id FROM orderdetails WHERE order_id=-1";
    env.database.query(sqlNullOrder, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = 'ไม่สามารถทำรายการได้';
            form.output.error.message = err.message;
            
            return res.json(form.output);
        }

        if (result.length == 0) {
            form.output.status = 0;
            form.output.descript = 'ไม่พบข้อมูล';
            
            return res.json(form.output);
        }

        form.output.data = {
            order: input.body.order_id,
            details: []
        };

        edit(result, 0);
    });

    let edit = (orders, ind) => {
        if (ind > orders.length-1) {
            return res.json(form.output);
        }

        let sql = "UPDATE orderdetails SET order_id=? WHERE od_id=?";
        let values = [input.body.order_id, orders[ind]];

        env.database.query(sql, values, (err, result) => {
            if (!err) form.output.data.details.push(orders[ind]);
            
            edit(orders, ind + 1);
        });
    };
});

module.exports = router;