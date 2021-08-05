const http = require('http');
const request = require('request');
const password_hash = require('password-hash');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mysql = require('mysql');
const express = require('express');

const app = require('./api/app');
const config = JSON.parse(fs.readFileSync('./config.json'))['deploy'];

global.env = {
    fs: fs,
    url: url,
    request: request,
    password_hash: password_hash,
    database: mysql.createPool(config.database),
    root: path.resolve(__dirname),
    config: config,
    form: (path) => { return JSON.parse(fs.readFileSync(path)) },
    input: (req) => { return {url: url.parse(req.url, true).query, body: req.body} },
    validate: (body, except) => {
        for (let [key, val] of Object.entries(body)) {
            if (except.includes(key)) continue;
            if (val == null) {
                return {
                    valid: false,
                    message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ!"
                };
            }
        }
    
        return {
            valid: true,
            message: "ข้อมูลถูกต้อง"
        };
    },
    get: (url, params, then) => {
        while (url.includes("*"))
            url = url.replace("*", params.shift());

        request.get({
            headers: {'content-type': 'application/json'},
            url: config.server.host + url,
        }, (err, response, body) => {
            if (!err)
                then(JSON.parse(body));
        });
    }
};

http.createServer(app).listen(process.env.port || env.config.server.port);

