const http = require('http');
const request = require('request');
const password_hash = require('password-hash');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mysql = require('mysql');
const express = require('express');

const app = require('./api/app');
const config = JSON.parse(fs.readFileSync('./config.json'))['debug'];

global.env = {
    fs: fs,
    url: url,
    request: request,
    password_hash: password_hash,
    database: mysql.createPool(config.database),
    root: path.resolve(__dirname),
    config: config,
    form: (path) => { return JSON.parse(fs.readFileSync(path)) },
    input: (req) => { return {
        url: url.parse(req.url, true).query,
        body: req.body
    }; },
};

http.createServer(app).listen(process.env.port || env.config.server.port);

