"use strict";
var express = require('express');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var config = require('./config');
var flash = require('connect-flash');

var app = express();
global.logger = null;

/**
 * 判断是否存在日志配置文件夹，不存在则创建
 * 创建后加载日志模块
 *
 */
if (!fs.existsSync(config.LOGPATH)) {
  mkdirp(config.LOGPATH, function(err) {
    var loggers = require('./log/log.js');
    // 打印日志模块
    global.logger = loggers.logger;
    logger.info("活动项目启动开始")
    logger.info("日志模块加载成功")
    if (config.LOGENV === "console") {
      logger.info("启动开发坏境打印模式")
      loggers.use(app);
    } else {
      logger.info("启动正式坏境打印模式")
    }
    _init();
  });
} else {
  var loggers = require('./log/log.js');
  // 打印日志模块
  global.logger = loggers.logger;
  logger.info("活动项目启动开始")
  logger.info("日志模块加载成功")
  if (config.LOGENV === "console") {
    logger.info("启动开发坏境打印模式")
    loggers.use(app);
  } else {
    logger.info("启动正式坏境打印模式")
  }
  _init();
}

function _init () {
  //app.set('env', 'production');
  logger.info('活动项目启动环境：' + process.env.NODE_ENV);
  logger.info('活动项目启动环境：' + app.get('env'));

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(session({
    secret: config.cookieSecret,
    key: config.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
      url: 'mongodb://localhost/eblog',
      autoRemove: 'interval',
      autoRemoveInterval: 10
    })
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', require('./routes/index'));
  app.use('/users', require('./routes/users'));

  process.on('uncaughtException', function(err) {
    logger.error('===============uncaughtException===============')
    logger.error(err);
    logger.error(err.stack);
  });

// catch 404 and forward to error handler
  logger.info('添加捕获404异常模块');
  //捕获404异常并且重定向到404错误
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    logger.error(req.url + '未找到');
    next(err);
  });
  logger.info('添加捕获404异常模块成功');




// error handlers
  logger.info('添加异常处理模块');
// development error handler
// will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      logger.error('请求状态：' + err.status + '; 错误原因' + err.message);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    logger.error('请求状态：' + err.status + '; 错误原因' + err.message);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
  logger.info('添加异常处理模块成功');

  module.exports = app;
  logger.info('活动项目启动完成');
}