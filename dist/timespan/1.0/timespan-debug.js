define(function(require, exports, module) {
'use strict'; 

/**
 * 本模块提供时间跨度操作。
 * @module timespan@1.0
 * @category Utility
 */


// 时间单位
var timeUnits = {
	SEC: 1000,
	MIN: 60 * 1000,
	HOUR: 60 * 60 * 1000,
	DAY: 24 * 60 * 60 * 1000,
	MONTH: 30 * 24 * 60 * 60 * 1000,
	YEAR: 365 * 24 * 60 * 60 * 1000
};


/**
 * 把带单位的时间跨度转换为毫秒表示。
 * @method parse
 * @param {Number|String} timespan 时间跨度。为数字时表示毫秒，为字符串时支持以下格式（%表示数字）：
 *   %secs；
 *   %mins；
 *   %hours；
 *   %days；
 *   %months；
 *   %years。
 * @return {Number} 时间跨度的毫秒表示。
 */
var parse = exports.parse = function(timespan) {
	// str为数字，直接返回
	if (typeof timespan === 'number') { return timespan; }
	if (!isNaN(timespan)) { return Number(timespan); }

	var num = parseFloat(timespan);
	if (isNaN(num)) {
		throw new Error('Invalid timespan string');
	}

	var unit = timespan.split(num)[1]
		.trim()
		.toUpperCase()
		.replace(/S$/, ''); // 移除复数时的s

	if (timeUnits.hasOwnProperty(unit)) {
		return num * timeUnits[unit];
	} else {
		throw new Error('Invalid time unit "' + unit + '"');
	}
};


/**
 * 以指定日期对象的毫秒表示加上指定时间跨度的毫秒表示，生成新的日期对象。
 * @method addToDate
 * @param {Date|Number} date 指定日期对象或日期的毫秒表示。
 * @param {Number|String} timespan 时间跨度，为数字时表示毫秒，为字符串时支持的格式同parse。
 * @return {Date} 表示相加结果的日期对象。
 */
exports.addToDate = function(date, timespan) {
	return new Date(
		(typeof date === 'number' ? date : date.getTime()) + parse(timespan)
	);
};

});