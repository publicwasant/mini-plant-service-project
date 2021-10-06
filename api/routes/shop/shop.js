const express = require('express');
const router = express.Router();

const reorganize = (item, then) => {
    env.get({url: "/shop/rate", params: [], then: (rating) => {
        then({
            shop: {
                email: item.shop_email,
                phone: item.shop_phone,
                images: JSON.parse(item.shop_imgsURL)
            }, 
            bank: {
                name: item.shop_bk_name,
                owner: item.shop_bk_owner,
                number: item.shop_bk_number,
                prompay: item.shop_bk_prompay
            }, 
            rating: rating.data
        });
    }});
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const sql = "SELECT * FROM shops WHERE shop_id=0";
    
    env.database.query(sql, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = null;

            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(result[0], (items) => {
                form.output.status = 1;
                form.output.descript = "พบข้อมูลร้านค้าแล้ว";
                form.output.data = items;

                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบข้อมูลร้านค้า!";
            form.output.data = null;

            return res.json(form.output);
        }
    });
});

module.exports = router;