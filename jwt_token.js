const jwt = require('jwt-simple');
const jwt_decode = require('jwt-decode');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;

const secrect_key = "golden";

const get = (status, id, then) => {
    const sql = "SELECT * FROM active WHERE status=? AND id=?";
    const values = [status, id];

    return env.database.query(sql, values, (err, result) => {
        if (err)
            return then(null);
        return then(result[0]);
    });
};

const add = (status, id, iat, then) => {
    const sql = "INSERT INTO active (status, id, iat) VALUES ?";
    const values = [[[status, id, iat]]];

    return env.database.query(sql, values, (err, result) => {
        if (err)
            return then(null);
        return then(result.affectedRows > 0);
    });
};

const edit = (status, id, iat, then) => {
    const sql = "UPDATE active SET iat=? WHERE status=? AND id=?";
    const values = [iat, status, id];

    return env.database.query(sql, values, (err, result) => {
        if (err)
            return then(null);
        return then(result.affectedRows > 0);
    });
};

const generate = (status, id, then) => {
    const iat = env.key.random() + ".accept";
    const token = (result) => {
        return then(result ? jwt.encode({
            status: status,
            id: id,
            iat: iat
        }, secrect_key) : null);
    };

    return get(status, id, (sub) => {
        return sub ? edit(status, id, iat, token) : add(status, id, iat, token);
    });
};

const deny = (status, id, then) => {
    return edit(status, id, env.key.random() + ".deny", (result) => {
        return then(result);
    });
};

const verify = (payload, then) => {
    return get(payload.status, payload.id, (sub) => {
        return sub ? then(payload.iat == sub.iat) : then(false);
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