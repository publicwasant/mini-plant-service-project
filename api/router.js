const express = require('express');
const fs = require('fs');
const url = require('url');

module.exports = {
    env: {
        fs: fs,
        url: url,
        request: require('request'),
        password_hash: require('password-hash'),
        database: require('./database'),
        config: JSON.parse(fs.readFileSync('./config.json')),
        form: ( path ) => { return JSON.parse(fs.readFileSync(path)) },
        input: ( req ) => { return {
            url: url.parse(req.url, true).query,
            body: req.body
        }; },
        
    },
    router: express.Router()
};