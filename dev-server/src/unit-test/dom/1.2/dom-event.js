var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('基本调用', function(assert) {
	assert.expect(1);

	function handler() { assert.ok(true); }

	var $test = $('#test');
	$test.on('click', handler);
	$test.click();

	$test.off('click', handler);
	$test.click();
});

QUnit.test('事件代理', function(assert) {
	var logs = [];

	var $test = $('#test');
	$test.on('mouseenter', function(e) {
		logs.push(e.target.className);
	}, {
		delegator: '.test1'
	});

	$test.mouseenter();
	$test.children().mouseenter();
	$test.off();

	assert.deepEqual(logs, ['test1']);
});