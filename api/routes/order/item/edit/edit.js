const express = require('express');
const router = express.Router();

const token = require('./../../../../../jwt_token');

router.put('/', token.auth((payload, done) => {
    payload.status == 1 ? 
        token.verify(payload, (result) => {
            done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, []);

    if (vat.valid) {
        env.get({token: input.header.authorization, url: "/order/item?id=*", params: [input.body.id], then: (item) => {
            if (item.status == 1) {
                if (item.data[0].order_id == null) {
                    const sql = "UPDATE orderitems SET oitem_amount=?, oitem_price=? WHERE oitem_id=?";
                    const values = [input.body.amount, item.data[0].product.price.actual * input.body.amount, input.body.id];

                    env.database.query(sql, values, (err, result) => {
                        if (err) {
                            form.output.status = 0;
                            form.output.descript = "เกิดช้อผิดพลาดบางอย่าง!";
                            form.output.error = err;
                            form.output.data = [];
                        
                            return res.json(form.output);
                        }

                        env.get({token: input.header.authorization, url: "/order/item?id=*", params: [input.body.id], then: (r) => {
                            form.output.status = 1;
                            form.output.descript = "แก้ไขข้อมูลสำเร็จแล้ว";
                            form.output.error = null;
                            form.output.data = r.data[0];
                        
                            return res.json(form.output);
                        }});
                    });
                } else {
                    form.output.status = 0;
                    form.output.descript = "ไม่สามารถทำรายการได้ เนื่องจากยื่นยันรายการสั่งซื้อแล้ว!";
                    form.output.error = null;
                    form.output.data = [];
        
                    return res.json(form.output);
                }
            } else {
                form.output.status = 0;
                form.output.descript = "ไม่พบรายการสั่งซื้อ!";
                form.output.error = null;
                form.output.data = [];
    
                return res.json(form.output);
            }
        }});
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.error = null;
        form.output.data = [];
    
        return res.json(form.output);
    }
});

module.exports = router;