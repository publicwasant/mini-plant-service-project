const express = require('express');
const router = express.Router();

let alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM customers WHERE cus_id=?",
            values: [param.id]
        };
    } else if (param.key) {
        return {
            sql: "SELECT * FROM customers WHERE cus_name LIKE ?",
            values: ["%" + param.key + "%"]
        };
    } else {
        return {
            sql: "SELECT * FROM customers",
            values: []
        };
    }
};

let reorganize = (items) => {
    for (let [key, val] of Object.entries(items)) {
        items[key] = {
            id: val.cus_id,
            name: val.cus_name,
            email: val.cus_email,
            addr: val.cus_addr,
            phone: val.cus_phone,
            status: val.cus_status,
            image: val.cus_imgURL,
            shoprated: val.cus_shoprated
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
            form.output.descript = 'ไม่สามารถค้นหาข้อมูลลูกค้าได้';
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            form.output.status = 1;
            form.output.descript = 'พบข้อมูลลูกค้าแล้ว ' + result.length + ' รายการ';
            form.output.data = reorganize(result);

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = 'ไม่พบข้อมูลลูกค้า';
            form.output.data = [];
                
            return res.json(form.output);
        }
    });
});

module.exports = router;