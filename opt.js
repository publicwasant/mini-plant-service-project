const fs = require('fs');

const read = (then) => {
    env.fs.readFile("." + env.config.paths.storage.opt + "usagelist.json", (err, data) => {
        if (err) 
            return then(null);
        return then(data);
    });
};

const write = (data, then) => {
    env.fs.writeFile("." + env.config.paths.storage.opt + "usagelist.json", data, (err) => {
        if (err)
            return then(false);
        return then(true);
    });
};

const generate = () => {};
const available = () => {};