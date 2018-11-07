var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;
var logs = window.logs;


QUnit.test('基本调用', function(assert) {
	var done = assert.async();
	$(function() {
		logs.push(3);
		assert.deepEqual(logs, [1, 2, 3]);
		done();
	});
});