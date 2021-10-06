const express = require('express');
const router = express.Router();

const reorganize = (then) => {
    env.get({url: "/user/customer", params: [], then: (response) => {
        let sum = 0;
        let rateditems = [];

        for (const customer of response.data) {
            if (customer.shoprated != null) {
                sum += customer.shoprated;
                rateditems.push(customer);
            }
        }

        then({
            average: Math.floor(sum/rateditems.length),
            customers: rateditems
        });
    }});
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    reorganize((items) => {
        form.output.status = 1;
        form.output.descript = "พบข้อมูลแล้ว " + items.length + " รายการ";
        form.output.data = items;

        return res.json(form.output);
    });
});

module.exports = router;