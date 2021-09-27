const express = require('express');
const router = express.Router();

const alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM employees WHERE emp_id=?",
            values: [param.id]
        };
    } else if (param.key) {
        return {
            sql: "SELECT * FROM employees WHERE emp_username LIKE ? OR emp_name LIKE ?",
            values: ["%" + param.key + "%", "%" + param.key + "%"]
        };
    } else {
        return {
            sql: "SELECT * FROM employees",
            values: []
        };
    }
};

const reorganize = (items) => {
    for (const [key, val] of Object.entries(items)) {
        items[key] = {
            id: val.emp_id,
            username: val.emp_username,
            name: val.emp_name,
            email: val.emp_email,
            addr: val.emp_addr,
            phone: val.emp_phone,
            status: val.emp_status,
            image: val.emp_imgURL
        };
    }

    return items;
};

router.get('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = 'ไม่สามารถค้นหาข้อมูลพนักงานได้';
            form.output.error = err;
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            form.output.status = 1;
            form.output.descript = 'พบข้อมูลพนักงานแล้ว ' + result.length + ' รายการ';
            form.output.data = reorganize(result);

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = 'ไม่พบข้อมูลพนักงาน';
            form.output.data = [];
            
            return res.json(form.output);
        }
    });
});

module.exports = router;