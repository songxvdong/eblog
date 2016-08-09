/*!
 * author
 * Copyright(c) 2016 Wang Xu
 * kongkonghu.com Licensed
 */
var fs = require('fs');
var log4js = require('log4js');
var config = require('../config.js');
var levelConfig = config.LOGENV == 'formal' ? 'info' : 'debug'; //日志级别配置
var pathConfig = config.LOGPATH; //日志文件存储路径配置
var _ = require('underscore');

/**
 *  log4js配置:
 *     打印类型：
 *        1、本地控制台打印 -- type = console
 *        2、日志按天切割打印 -- type = dateFile
 * 
 *     替换Nodejs全局console打印：是
 * 
 *     日志级别:
 *        1、自动
 *        2、自动
 *
 */
log4js.configure({
	appenders: [{
			type: 'console',
			category: "console"

		}, //控制台输出
		{
			type: "dateFile",
			filename: pathConfig + '/eblog',
			pattern: "_yyyy-MM-dd.log",
			category: 'formal',
			alwaysIncludePattern: true
		} //日期文件格式
	],
	replaceConsole: true, //替换console.log
	levels: {
		formal: 'auto',
		console: 'auto'
	}
});

/**
 * 返回日志打印对象
 *
 * @return {object}
 * @public
 */
var logger = log4js.getLogger(config.LOGENV);
exports.logger = logger;

/**
 * 返回express集成log4js的方法
 *
 * @param {object|express} encodings...
 * @return {Function}
 * @public
 */
exports.use = function(app) {
	app.use(log4js.connectLogger(logger, {
		level: levelConfig,
		format: ':method :url'
	}));
}

/**
 * 日志文件删除定时任务：
 * 每天凌晨2点删除日志文件，只保留最近五天的日志文件
 * 不符合日志格式的文件会报出
 *
 */
var schedule = require("node-schedule");
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 2;
rule.minute = 0;
var j = schedule.scheduleJob(rule, function() {
	logger.info('执行日志文件定时删除任务');
	var logFiles = fs.readdirSync(pathConfig);
	_.each(logFiles, function(logFile) {
		if (logFile.indexOf('.') > -1) {
			var filePattern = logFile.split('.')[1];
			if (filePattern === 'log') {
				if (logFile.split('.')[0] !== null && logFile.split('.')[0] !== undefined && logFile.split('.')[0].split('_').length === 2) {
					var logDate = logFile.split('.')[0].split('_')[1];
					var logDateSplice = new Date().getTime() - new Date(logDate).getTime();
					var days = parseInt(logDateSplice / (1000 * 60 * 60 * 24));
					logger.info(logFile);
					logger.info(logDate);
					logger.info(new Date(logDate));
					logger.info(new Date());
					logger.info(days);
					if (days >= 4) {
						fs.unlink(pathConfig + '/' + logFile, function(msg) {
							if (msg === null) {
								logger.info('删除' + logDate + '的日志');
							} else {
								logger.error(msg);
							}
						});
					}
				} else {
					logger.error('存在异常文件' + logFile + '，请检查日志目录')
				}
			}
		}
	});
});
