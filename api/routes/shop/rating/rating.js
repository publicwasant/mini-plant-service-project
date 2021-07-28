const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (val == null || val == '') {
            return {
                valid: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ'
            };
        }
    }

    if (!(body.srate_points >= 0 && body.srate_points <= 5)) {
        return {
            valid: false,
            message: "ช่วงคะแนน 0-5 เท่านั้น!"
        };
    }

    return {
        valid: true,
        message: 'ข้อมูลถูกต้อง'
    };
};

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    let vat = validate(input.body);

    if (vat.valid) {
        let sql = "SELECT * FROM shop_rate WHERE srate_cus_id=? AND srate_shop_id=?";
        let values = [input.body.srate_cus_id, input.body.srate_shop_id];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
                form.output.error.message = err;

                return res.json(form.output);
            }

            let tsrate_id;
            let tsql;
            let tvalues;

            if (result.length == 1) {
                tsrate_id = result[0].srate_id;
                tsql = "UPDATE shop_rate SET srate_points=? WHERE srate_id=?";
                tvalues = [input.body.srate_points, result[0].srate_id];
            } else {
                tsql = "INSERT INTO shop_rate (srate_cus_id, srate_shop_id, srate_points) VALUES ?";
                tvalues = [[[input.body.srate_cus_id, input.body.srate_shop_id, input.body.srate_points]]];
            }

            env.database.query(tsql, tvalues, (err, result) => {
                if (!err && result.affectedRows > 0) {
                    let new_id;

                    if (tsrate_id != null) {
                        new_id = tsrate_id;
                    } else {
                        new_id = result.insertId;
                    }

                    form.output.status = 1;
                    form.output.descript = "ให้คะแนนร้านแล้ว";
                    form.output.data = {
                        srate_id: new_id,
                        srate_cus_id: input.body.srate_cus_id,
                        srate_shop_id: input.body.srate_shop_id,
                        srate_points: input.body.srate_points
                    };

                    return res.json(form.output);
                } else {
                    form.output.status = 0;
                    form.output.descript = "ให้คะแนนร้านไม่ได้!";
                    form.output.error.message = err;

                    return res.json(form.output);
                }
            });
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;

        return res.json(form.output);
    }
});

module.exports = router;