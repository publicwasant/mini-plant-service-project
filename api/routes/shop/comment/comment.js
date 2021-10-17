const express = require('express');
const router = express.Router();

const alternate = (param) => {
    if (param.id) {
        return {
            sql: "SELECT * FROM comments WHERE cm_id=?",
            values: [param.id]
        };
    } else if (param.previous_id) {
        return {
            sql: "SELECT * FROM comments WHERE cm_previous_id=?",
            values: [param.previous_id]
        };
    } else {
        return {
            sql: "SELECT * FROM comments WHERE cm_previous_id IS NULL ORDER BY cm_id DESC",
            values: []
        };
    }
};

const reorganize = (items, then) => {
    let fetch = (ind) => {
        env.get({url: "/shop/comment?previous_id=*", params: [items[ind].cm_id], then: (replier) => {
            env.get({url: "/user/customer?id=*", params: [items[ind].cm_cus_id], then: (customer) => {
                env.get({url: "/user/employee?id=*", params: [items[ind].cm_emp_id], then: (employee) => {
                    items[ind] = {
                        id: items[ind].cm_id,
                        previous_id: items[ind].cm_previous_id,
                        shop_id: items[ind].cm_shop_id,
                        date: items[ind].cm_date,
                        text: items[ind].cm_text,
                        owner: employee.status == 1 ? {
                            status: 0,
                            id: employee.data[0].id,
                            name: employee.data[0].name,
                            image: employee.data[0].image,
                            shoprated: null
                        } : {
                            status: 1,
                            id: customer.data[0].id,
                            name: customer.data[0].name,
                            image: customer.data[0].image,
                            shoprated: customer.data[0].shoprated
                        },
                        replier: replier.status == 1 ? replier.data : []
                    };

                    if (ind + 1 < items.length) {
                        fetch (ind + 1);
                    } else {
                        then(items);
                    }
                }});
            }});
        }});
    };

    fetch(0);
};

router.get('/', (req, res) => {
    const form = env.form(__dirname + '/form.json');
    const input = env.input(req);

    const alt = alternate(input.url);
    
    env.database.query(alt.sql, alt.values, (err, result) => {
        if (err) {
            form.output.status = 0;
            form.output.descript = "เกิดข้อผิดพลาดบางอย่าง!";
            form.output.error = err;
            form.output.data = null;
            
            return res.json(form.output);
        }

        if (result.length > 0) {
            reorganize(result, (items) => {
                form.output.status = 1;
                form.output.descript = "พบข้อมูลแล้ว " + result.length + " รายการ";
                form.output.data = items;
                
                return res.json(form.output);
            });
        } else {
            form.output.status = 0;
            form.output.descript = "ไม่พบรายการ!";
            form.output.error = err;
            form.output.data = null;
            
            return res.json(form.output);
        }
    });
});

module.exports = router;