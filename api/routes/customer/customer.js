
const express = require('express');
const fs = require('fs');
const url = require('url');
const events = require('events');
const request = require('request');

// const JWTToken = require('./@@jwt_token');
const database = require('../../../database');

const router = express.Router();

router.get('/', function (req, res) {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const fg = JSON.parse(fs.readFileSync(__dirname+'/fg_customer.json'));
    
    const input = url.parse(req.url, true).query;
    const output = fg.output;

    const emitter = new events.EventEmitter();

    emitter.on('', function (_attach_) {
    });

    emitter.on('response', function (_attach_) {
        output.status = _attach_.status;
        output.descript = _attach_.descript;
        output.error = _attach_.err;
        output.data = _attach_.data;

        return res.status(200).json(output);
    });

    return emitter.emit('response', {});
});

router.post('/', function (req, res) {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const fg = JSON.parse(fs.readFileSync(__dirname+'/fg_customer.json'));
    const body = req.body;

    const input = {};
    const output = fg.output;

    const emitter = new events.EventEmitter();

    emitter.on('', function (_attach_) {
    });

    emitter.on('response', function (_attach_) {
        output.status = _attach_.status;
        output.descript = _attach_.descript;
        output.error = _attach_.err;
        output.data = _attach_.data;

        return res.status(200).json(output);
    });

    return emitter.emit('', {});
});

module.exports = router;