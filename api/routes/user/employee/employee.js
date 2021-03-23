const express = require('express');
const router = express.Router();

let alternate = (param) => {
    let result = {
        sql: null,
        values: null
    };

    if (param.id) {
        result.sql = "SELECT emp_id, emp_username, emp_email, emp_name, emp_addr, emp_phone, emp_imgURL, emp_status FROM employees WHERE emp_id=?";
        result.values = [param.id];
    } else if (param.key) {
        result.sql = "SELECT emp_id, emp_username, emp_email, emp_name, emp_addr, emp_phone, emp_imgURL, emp_status "
            + "FROM employees WHERE emp_username LIKE '%" + param.key + "%' OR emp_name LIKE '%" + param.key + "%'";
        result.values = [];
    } else {
        result.sql = "SELECT emp_id, emp_username, emp_email, emp_name, emp_addr, emp_phone, emp_imgURL, emp_status FROM employees";
        result.values = [];
    }

    return result;
};

router.get('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = 'ไม่สามารถค้นหาข้อมูลพนักงานได้';
            form.output.error.message = err.message;

            return res.json(form.output);
        }

        let employees = result;

        if (employees.length > 0) {
            form.output.status = 1;
            form.output.descript = 'พบข้อมูลพนักงานแล้ว ' + employees.length + ' รายการ';
            form.output.data = employees;

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = 'ไม่พบข้อมูลพนักงาน';
            
            return res.json(form.output);
        }
    });
});

router.post('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

module.exports = router;