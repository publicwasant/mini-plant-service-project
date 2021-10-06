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
    form: (path) => { 
        return JSON.parse(fs.readFileSync(path)) 
    },
    input: (req) => { 
        return {
            header: req.headers, 
            url: url.parse(req.url, true).query, 
            parsedUrl: url.parse(req.url, true),
            body: req.body
        } 
    },
    date: {
        current: () => {
            const date = new Date();

            return {
                date: ("0" + date.getDate()).slice(-2),
                month: ("0" + (date.getMonth() + 1)).slice(-2),
                year: date.getFullYear(),
                hours: date.getHours(),
                minutes: date.getMinutes(),
                seconds: date.getSeconds()
            };
        },
        simple: () => {
            const current = env.date.current();

            return current.year + "-" + current.month + "-" + current.date;
        },
        full: () => {
            const current = env.date.current();

            return current.year + "-" + current.month + "-" + current.date + " " 
                + current.hours + ":" + current.minutes + ":" + current.seconds;
        },
        time: () => {
            const current = env.date.current();

            return current.hours + ":" + current.minutes + ":" + current.seconds;
        },
        between: (from, to, date) => {
            const dFrom = new Date(from);
            const dTo = new Date(to);
            const dDate = new Date(date);

            return (dDate <= dTo && dDate >= dFrom);
        },
        equals: (date1, date2) => {
            const d1 = new Date(date1);
            const d2 = new Date(date2);

            return (d1.getFullYear() == d2.getFullYear())
                && (d1.getMonth() == d2.getMonth())
                && (d1.getDate() == d2.getDate());
        }
    },
    key: {
        random: (stime=100000) => {
            const time = parseInt(env.date.time().replace(":", "").replace(":", ""));
            const seed = Math.floor(Math.random() * stime + stime);
            
            return (time * seed).toString(36);
        },
    },
    validate: (body, except) => {
        const keys = Object.keys(body);
        const result = {valid: true, message: null};
        
        for (let i=0; i < keys.length; i++) {
            const key = keys[i];
            const val = body[keys[i]];

            if (except.includes(key)) continue;
            if (val == null) {
                result.valid = false;
                result.message = result.message == null ? "กรุณากรอกข้อมูล " : result.message;
                result.message = result.message + key;
                result.message = result.message + ", ";
            }
        }
    
        return result;
    },
    get: (properties) => {
        while (properties.url.includes("*"))
            properties.url = properties.url.replace("*", properties.params.shift());

        return request.get({
            headers: {
                "content-type": "application/json",
                "authorization": properties.token
            },
            url: config.server.host + properties.url,
        }, (err, response, body) => {
            if (!err)
                properties.then(JSON.parse(body));
        });
    },
    post: (properties) => {
        return request.post({
            headers: {
                "content-type": "application/json",
                "authorization": properties.token
            },
            url: config.server.host + properties.url,
            body: JSON.stringify(properties.body)
        }, (err, response, body) => {
            if (!err)
                properties.then(JSON.parse(body));
        });
    },
};

http.createServer(app).listen(process.env.port || env.config.server.port);

