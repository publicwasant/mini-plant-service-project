const express = require('express');
const router = express.Router();

let validate = (url) => {
    let tsql;
    let tvalues;
    
    if (url.id) {
        tsql = "SELECT * FROM shop WHERE shop_id=?";
        tvalues = [url.id];
    } else {
        tsql = "SELECT * FROM shop";
        tvalues = [];
    }

    return {sql: tsql, values: tvalues};
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = validate(input.url);

    env.database.query(vat.sql, vat.values, (err, result) => {
        if (!err && result.length > 0) {
            form.output.status = 1;
            form.output.descript = "พบข้อมูลแล้ว " + result.length + " รายการ";
            form.output.data = result;

            return res.json(form.output);
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูล!";
            form.output.error.message = err;

            return res.json(form.output);
        }
    });
});


module.exports = router;