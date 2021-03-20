const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    if (input.url.id) {
        let sql = "SELECT cus_email, cus_name, cus_addr, cus_phone, cus_imgURL FROM customers"
            + " WHERE cus_id=?";
        let values = [input.url.id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'ไม่สามารถค้นหาข้อมูลลูกค้าได้';
                form.output.error.message = err.message;

                return res.json(form.output);
            }

            let products = result;

            if (products.length > 0) {
                form.output.status = 1;
                form.output.descript = 'พบข้อมูลลูกค้าแล้ว ' + products.length + ' รายการ';
                form.output.data = products;

                return res.json(form.output);
            } else {
                form.output.status = 0;
                form.output.descript = 'ไม่พบข้อมูลลูกค้า';
                
                return res.json(form.output);
            }
        });
    } else if (input.url.key) {
        let sql = "SELECT cus_email, cus_name, cus_addr, cus_phone, cus_imgURL FROM customers"
            + " WHERE cus_name LIKE '%" + input.url.key + "%'";

        env.database.query(sql, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'ไม่สามารถค้นหาข้อมูลลูกค้าได้';
                form.output.error.message = err.message;

                return res.json(form.output);
            }

            let products = result;

            if (products.length > 0) {
                form.output.status = 1;
                form.output.descript = 'พบข้อมูลลูกค้าแล้ว ' + products.length + ' รายการ';
                form.output.data = products;

                return res.json(form.output);
            } else {
                form.output.status = 0;
                form.output.descript = 'ไม่พบข้อมูลลูกค้า';
                
                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = 'ไม่พบเซอร์วิส';
        form.output.error.message = '404 Not found.';

        return res.json(form.output); 
    }
});

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    return res.json(form.output);
});

module.exports = router;