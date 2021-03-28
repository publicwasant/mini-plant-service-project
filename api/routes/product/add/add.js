const express = require('express');
const router = express.Router();

let validate = (body) => {
    for (let [key, val] of Object.entries(body)) {
        if (key == 'pr_detail') continue;
        if (key == 'pr_type') continue;
        if (key == 'pr_size') continue;
        if (key == 'pr_price') continue;
        if (key == 'pr_discount') continue;
        if (key == 'pr_status') continue;
        if (key == 'pr_imgsURL') continue;

        if (val == null || val == '') {
            return {
                valid: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ'
            };
        }
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
        let sql = "INSERT INTO products "
            + "(pr_name, pr_detail, pr_type, pr_size, pr_price, pr_status, pr_imgsURL) "
            + "VALUES ?";

        let values = [[
            input.body.pr_name,
            input.body.pr_detail,
            input.body.pr_type,
            JSON.stringify(input.body.pr_size),
            input.body.pr_price, 
            input.body.pr_status,
            JSON.stringify(input.body.pr_imgsURL)
        ]];
        
        env.database.query(sql, [values], (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = 'บันทึกข้อมูลไม่สำเร็จ';
                form.output.error.message = err.message;

                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                form.output.status = 1;
                form.output.descript = 'บันทึกข้อมูสำเร็จแล้ว';
                form.output.data = {
                    pr_id: result.insertId,
                    pr_title: input.body.pr_name,
                    pr_detail: input.body.pr_detail,
                    pr_type: input.body.pr_type,
                    pr_size: input.body.pr_size,
                    pr_price: input.body.pr_price, 
                    pr_status: input.body.pr_status,
                    pr_imgsURL: input.body.pr_imgsURL
                };
            } else {
                form.output.status = 0;
                form.output.descript = 'บันทึกข้อมูลไม่สำเร็จ';

                return res.json(form.output);
            }

            
            return res.json(form.output);
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;

        return res.json(form.output);
    }
});

module.exports = router;