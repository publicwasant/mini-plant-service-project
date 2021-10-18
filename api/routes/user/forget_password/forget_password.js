const express = require('express');
const router = express.Router();

const get = (key, then) => {
    const sqlc = "SELECT cus_id, cus_password FROM customers WHERE cus_email=?";
    const sqle = "SELECT emp_id, emp_password FROM employees WHERE emp_email=?";
    const values = [key];

    return env.database.query(sqlc, values, (err, result) => {
        return result.length > 0 ? then({
            status: 1,
            id: result[0].cus_id
        }) : env.database.query(sqle, values, (err, result) => {
            return result.length > 0 ? then({
                status: 0,
                id: result[0].emp_id
            }) : then(null);
        });
    });
};

const alternate = (user, body) => {
    if (user.status == 0) {
        return {
            sql: "UPDATE employees SET emp_password=? WHERE emp_id=?",
            values: [env.password_hash.generate(body.new_password), user.id]
        };
    } else if (user.status == 1) {
        return {
            sql: "UPDATE customers SET cus_password=? WHERE cus_id=?",
            values: [env.password_hash.generate(body.new_password), user.id]
        };
    }
};

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        get(input.body.email, (user) => {
            if (user) {
                const alt = alternate(user, input.body);

                env.database.query(alt.sql, alt.values, (err, result) => {
                    if (err) {
                        form.output.status = 0;
                        form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                        form.output.error = err;
                        form.output.data = null;

                        return res.json(form.output);
                    }

                    if (result.affectedRows > 0) {
                        form.output.status = 1;
                        form.output.descript = "ทำรายการสำเร็จแล้ว";
                        form.output.data = user;

                        return res.json(form.output);
                    } else {
                        form.output.status = 0;
                        form.output.descript = "ทำรายการไม่สำเร็จแล้ว!";
                        form.output.data = null;

                        return res.json(form.output);
                    }
                });
            } else {
                form.output.status = 0;
                form.output.descript = "ไม่พบข้อมูลผู้ใช้!";
                form.output.data = null;

                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.data = null;

        return res.json(form.output);
    }
});

module.exports = router;