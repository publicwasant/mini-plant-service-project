const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const input = env.input(req);

    env.fs.readFile("." + env.config.paths.storage.media.image + input.url.p, (err, data) => {
        if (err) {
            return res.status(404).end(err);
        }

        return res.status(200).end(data);
    });
});

module.exports = router;