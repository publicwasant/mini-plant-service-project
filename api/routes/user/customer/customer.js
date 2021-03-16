const express = require('express');
const router = express.Router();

prep = (body) => {
    let key = Object.keys(body);
    console.log(key);
};

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    prep(input.body);

    return res.json(form.output);
});

module.exports = router;