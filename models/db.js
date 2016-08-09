/**
 * Created by songxvdong on 2016/8/2.
 */
"use strict";

var config = require('../config'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports = function() {
    return new Db(config.db, new Server(config.host, config.port), {safe: true, poolSize: 1});
}