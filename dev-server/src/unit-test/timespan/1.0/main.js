var ts = require('timespan/1.0/timespan');
var QUnit = window.QUnit;


QUnit.test('parse', function(assert) {
	// 一天的毫秒数
	var dayTime = 1000 * 60 * 60 * 24;

	assert.strictEqual(ts.parse(1000), 1000, '数字（number）');
	assert.strictEqual(ts.parse('1000'), 1000, '数字（string）');
	assert.strictEqual(ts.parse('2secs'), 2000, 'sec单位');
	assert.strictEqual(ts.parse('2mins'), 2000 * 60, 'min单位');
	assert.strictEqual(ts.parse('2hours'), 2000 * 60 * 60, 'hour单位');
	assert.strictEqual(ts.parse('2 day'), 2 * dayTime, 'day单位');
	assert.strictEqual(ts.parse('2 months'), 2 * 30 * dayTime, 'month单位');
	assert.strictEqual(ts.parse('2 years'), 2 * 365 * dayTime, 'year单位');
});

// addToDate里使用了parse，上面单位部分不再重测
QUnit.test('addToDate', function(assert) {
	function getNewDate(value) {
		var oDate = new Date('2018-10-24');
		var nDate = ts.addToDate(oDate, value);
		return nDate;
	}

	assert.strictEqual(
		getNewDate('1day').getTime(),
		new Date('2018-10-25').getTime()
	);
	assert.strictEqual(
		getNewDate(1000 * 60 * 60 * 24).getTime(),
		new Date('2018-10-25').getTime()
	);
});