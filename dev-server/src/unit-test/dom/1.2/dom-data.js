var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('测试set和get方法', function(assert) {
	var $node = $('body');
	assert.strictEqual($node.data('key'), undefined, 'No data');

	$node.data('key', 'value');
	assert.strictEqual($node.data('key'), 'value', 'Get data');

	$node.removeData('key');
	assert.strictEqual($node.data('key'), undefined, 'Remove single data');

	$node.data('key2', 'value2');
	$node.removeData();
	assert.strictEqual($node.data('key'), undefined, 'Remove all data');
	assert.strictEqual($node.data('key2'), undefined, 'Remove all data');
});