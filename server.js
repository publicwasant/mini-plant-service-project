const http = require('http');
const request = require('request');
const password_hash = require('password-hash');
const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');

const app = require('./api/app');
const database = require('./api/database');

global.env = {
    fs: fs,
    url: url,
    request: request,
    password_hash: password_hash,
    database: database,
    config: JSON.parse(fs.readFileSync('./config.json')),
    form: ( path ) => { return JSON.parse(fs.readFileSync(path)) },
    input: ( req ) => { return {
        url: url.parse(req.url, true).query,
        body: req.body
    }; },
};

http.createServer(app).listen(process.env.port || env.config.server.port);

