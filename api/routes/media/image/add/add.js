const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

const preparation_data = (type, base64) => {
    var invent_name = Math.random().toString(36).replace("0.", "");
    
    return {
        name: invent_name + "." + type,
        data: Buffer.from(base64, "base64")
    };
};

router.post('/', token.auth((payload, done) => {
    token.verify(payload, (result) => {
        return done(null, result);
    });
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const prep = preparation_data(input.body.type, input.body.base64);

    env.fs.writeFile("." + env.config.paths.storage.media.image + prep.name, prep.data, (err) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "บันทึกข้อมูลไม่สำเร็จ!";
            from.output.error = err;
            form.output.data = null;

            return res.json(form.output);
        }

        form.output.status = 1;
        form.output.descript = "บันทึกข้อมูลสำเร็จแล้ว";
        form.output.data = {
            url: env.config.server.host + "/media/image?p=" + prep.name
        };
            
        return res.json(form.output);
    });
});

module.exports = router;