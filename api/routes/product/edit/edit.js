const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

router.post('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

router.put('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

router.delete('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    // code...

    return res.json(form.output);
});

module.exports = router;