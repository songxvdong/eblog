/**
 * Created by songxvdong on 2016/8/2.
 */
"use strict";
console.log('=============',process.env.NODE_ENV);
module.exports = {
    cookieSecret: 'eblog',
    db: 'eblog',
    host: 'localhost',
    port: 27017,
    LOGENV: process.env.NODE_ENV === 'production' ? 'formal': "console",
    LOGPATH: "../logs/eblog"
};
