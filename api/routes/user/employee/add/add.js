const express = require('express');
const router = express.Router();

router.post('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

module.exports = router;