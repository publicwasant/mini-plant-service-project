const jwt = require('jwt-simple');
const jwt_decode = require('jwt-decode');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const fs = require('fs');

const mysql = require('mysql');
const config = JSON.parse(fs.readFileSync("./config.json"))["debug"];

const database = mysql.createPool(config.database);
const secrect_key = "golden";

const get = (status, id, then) => {
    const sql = "SELECT * FROM active WHERE status=? AND id=?";
    const values = [status, id];

    database.query(sql, values, (err, result) => {
        if (result.length > 0 && !err)
            return then(result[0]);

        return then(null);
    });
};

const add = (status, id, iat, then) => {
    const sql = "INSERT INTO active (status, id, iat) VALUES ?";
    const values = [[[status, id, iat]]];

    database.query(sql, values, (err, result) => {
        return then(result.affectedRows > 0 && !err);
    });
};

const edit = (status, id, iat, then) => {
    const sql = "UPDATE active SET iat=? WHERE status=? AND id=?";
    const values = [iat, status, id];

    database.query(sql, values, (err, result) => {
        return then(result.affectedRows > 0 && !err);
    });
};

const generate = (status, id, then) => {
    const seedIat = Math.random().toString(36).replace("0.", "");

    get(status, id, (sub) => {
        if (sub) {
            edit(status, id, seedIat, (result) => {
                if (result)
                    return then(jwt.encode({
                        status: status,
                        id: id,
                        iat: seedIat
                    }, secrect_key));
                
                return then(null);
            });
        } else {
            add(status, id, seedIat, (result) => {
                if (result)
                    return then(jwt.encode({
                        status: status,
                        id: id,
                        iat: seedIat
                    }, secrect_key));
                
                return then(null);
            });
        }
    });
};

const deny = (status, id, then) => {
    edit(status, id, "-", (result) => {
        return then(result);
    });
};

const verify = (payload, then) => {
    get(payload.status, payload.id, (sub) => {
        if (sub)
            return then(payload.iat == sub.iat);
        return then(false);
    });
};

const auth = (check) => {
    const options = {
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: secrect_key,
    };
    
    passport.use(new JwtStrategy(options, (payload, done) => {
        check(payload, done);
    }));

    return passport.authenticate('jwt', {session: false})
};

const free = () => {
    const options = {
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: secrect_key,
    };
    
    passport.use(new JwtStrategy(options, (payload, done) => {
        return done(null, true);
    }));

    return passport.authenticate('jwt', {session: false})
};

module.exports = {
    generate: (status, id, then) => { return generate(status, id, then); },
    deny: (status, id, then) => { return deny(status, id, then); },
    verify: (key, then) => { return verify(key, then); },
    auth: (check) => { return auth(check); },
    free: () => { return free(); },
};