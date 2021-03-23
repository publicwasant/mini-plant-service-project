const express = require('express');
const router = express.Router();

let alternate = (param) => {
    let result = {
        sql: null,
        values: null
    };
    
    if (param.id) {
        result.sql = "SELECT cus_id, cus_email, cus_name, cus_addr, cus_phone, cus_imgURL FROM customers WHERE cus_id=?";
        result.values = [param.id];
    } else if (param.key) {
        result.sql = "SELECT cus_id, cus_email, cus_name, cus_addr, cus_phone, cus_imgURL FROM customers WHERE cus_name LIKE '%" + param.key + "%'";
        result.values = [];
    } else {
        result.sql = "SELECT cus_id, cus_email, cus_name, cus_addr, cus_phone, cus_imgURL FROM customers";
        result.values = [];
    }

    return result;
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = 'ไม่สามารถค้นหาข้อมูลลูกค้าได้';
            form.output.error.message = err.message;

            return res.json(form.output);
        }

        let customers = result;

        if (customers.length > 0) {
            form.output.status = 1;
            form.output.descript = 'พบข้อมูลลูกค้าแล้ว ' + customers.length + ' รายการ';
            form.output.data = customers;

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = 'ไม่พบข้อมูลลูกค้า';
                
            return res.json(form.output);
        }
    });
});

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    return res.json(form.output);
});

module.exports = router;