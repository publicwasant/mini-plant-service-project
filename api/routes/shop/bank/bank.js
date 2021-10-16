const express = require('express');
const router = express.Router();

const alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM banks WHERE bk_id=?",
            values: [param.id]
        };
    } else {
        return {
            sql: "SELECT * FROM banks",
            values: []
        };
    }
};

const reorganize = (items, then) => {
    const fetch = (i) => {
        items[i] = {
            id: items[i].bk_id,
            name: items[i].bk_name,
            owner: items[i].bk_owner,
            number: items[i].bk_number,
            prompay: items[i].bk_prompay
        };
        
        if (i + 1 < items.length) {
            fetch(i+1);
        } else {
            then(items);
        }
    };

    fetch(0);
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = [];

            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(result, (items) => {
                form.output.status = 1;
                form.output.descript = "พบข้อมูลแล้ว " + items.length + " รายการ";
                form.output.error = err;
                form.output.data = items;

                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูล!";
            form.output.error = err;
            form.output.data = [];

            return res.json(form.output);
        }
    });
});

module.exports = router;