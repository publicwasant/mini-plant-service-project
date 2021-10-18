const express = require('express');
const router = express.Router();

const token = require('./../../../../jwt_token');

const related_to_product = (token, promotion_id, products_id, then) => {
    const sql = "DELETE FROM promotions_related_to_products WHERE pp_promotion_id=?";
    const values = [promotion_id];

    const fetch = (i) => {
        env.post({url: "/promotion/related_to_product/add", 
            token: token,
            body: {
                product_id: products_id[i], 
                promotion_id: promotion_id
            }, then: (res) => {
                if (i + 1 < products_id.length) {
                    fetch(i + 1);
                } else {
                    then(promotion_id);
                }
        }});
    };

    env.database.query(sql, values, (err, result) => {fetch(0)});
};

router.put('/', token.auth((payload, done) => {
    payload.status == 0 ?
        token.verify(payload, (result) => {
            done(null, result);
    }) : done(null, false);
}), (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const vat = env.validate(input.body, ["promo_imgURL"]);

    if (vat.valid) {
        const sql = "UPDATE promotions SET "
            + "promo_imgURL=?, "
            + "promo_start=?, "
            + "promo_end=?, "
            + "promo_discount=?, "
            + "promo_name=?, "
            + "promo_details=? "
            + "WHERE promo_id=?";
        
        const values = [
            JSON.stringify(input.body.images == null ? [] : input.body.images),
            input.body.start,
            input.body.end,
            input.body.discount,
            input.body.name,
            input.body.details,
            input.body.id
        ];

        env.database.query(sql, values, (err, result) => {
            if (err) {
                form.output.status = 0;
                form.output.descript = "แก้ไขข้อมูลไม่สำเร็จ!";
                form.output.error = err;
                form.output.data = [];
                
                return res.json(form.output);
            }

            if (result.affectedRows > 0) {
                related_to_product(input.header.authorization, input.body.id, input.body.products_id, (id) => {
                    env.get({url: "/promotion?id=*", params: [id], then: (p) => {
                        form.output.status = 1;
                        form.output.descript = "แก้ไขข้อมูลสำเร็จแล้ว";
                        form.output.error = null;
                        form.output.data = p.data[0];
    
                        return res.json(form.output);
                    }});
                });
            } else {
                form.output.status = 0;
                form.output.descript = "แก้ไขข้อมูลไม่สำเร็จ!";
                form.output.error = null;
                form.output.data = [];

                return res.json(form.output);
            }
        });
    } else {
        form.output.status = 0;
        form.output.descript = vat.message;
        form.output.error = null;
        form.output.data = [];

        return res.json(form.output);
    }
});

module.exports = router;