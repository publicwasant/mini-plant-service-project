const express = require('express');
const router = express.Router();

const alternate = (param) => {
    if (param.c && !param.p && !param.d && !param.m && !param.y && !param.s && !param.e) {
        return {
            sql: "SELECT * FROM history WHERE customer_id=? ORDER BY id DESC",
            values: [param.c]
        };
    } else if (param.c && !param.p && param.d && param.m && param.y && !param.s && !param.e) {
        return {
            sql: "SELECT * FROM history WHERE customer_id=? AND date=? ORDER BY id DESC",
            values: [param.c, param.d + "-" + param.m + "-" + param.y]
        };
    } else if (param.c && !param.p && !param.d && !param.m && !param.y && param.s && param.e) {
        return {
            sql: "SELECT * FROM history WHERE customer_id=? AND date between ? AND ? ORDER BY id DESC",
            values: [param.c, param.s, param.e]
        };
    } else if (!param.c && param.p && !param.d && !param.m && !param.y && !param.s && !param.e) {
    } else if (!param.c && param.p && param.d && param.m && param.y && !param.s && !param.e) {
    } else if (!param.c && param.p && !param.d && !param.m && !param.y && param.s && param.e) {
    }
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);

    return res.json(form.output);
});

module.exports = router;