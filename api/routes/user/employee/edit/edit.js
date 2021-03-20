const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

router.post('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

router.put('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

router.delete('/', function (req, res) {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

module.exports = router;