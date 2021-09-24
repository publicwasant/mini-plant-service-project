const jwt = require('jwt-simple');
const jwt_decode = require('jwt-decode');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;

const secrect_key = 'golden';

module.exports = {
    encode: (status, id) => {
        return jwt.encode({
            sub: {
                status: status,
                id: id
            }
        }, secrect_key);
    },
    decode: (token) => {
        return jwt_decode(token);
    },
    auth: (check) => {
        const options = {
            jwtFromRequest: ExtractJwt.fromHeader('authorization'),
            secretOrKey: secrect_key,
        };
        
        passport.use(new JwtStrategy(options, (payload, done) => {
            return done(null, check(payload));
        }));

        return passport.authenticate('jwt', {session: false})
    },
    free: () => {
        const options = {
            jwtFromRequest: ExtractJwt.fromHeader('authorization'),
            secretOrKey: secrect_key,
        };
        
        passport.use(new JwtStrategy(options, (payload, done) => {
            return done(null, true);
        }));

        return passport.authenticate('jwt', {session: false})
    }
};