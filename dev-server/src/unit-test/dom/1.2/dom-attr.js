var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('Attribute', function(assert) {
	var $node = $('<input type="checkbox" data-value="1" checked />');
	assert.strictEqual($node.attr('data-value'), '1', 'Get attribute');

	$node.attr('data-value', '2');
	assert.strictEqual($node.attr('data-value'), '2', 'Set attribute');

	$node.removeAttr('data-value');
	assert.equal($node.attr('data-value'), null, 'Remove attribute');

	assert.strictEqual($node.attr('checked'), 'checked', 'Get boolean attribute');
	$node.removeAttr('checked');
	assert.strictEqual($node.attr('checked'), null, 'Remove boolean attribute');

	$node = $('#test-link');
	assert.strictEqual($node.attr('href'), './test', 'Get href attribute');
});

QUnit.test('Property', function(assert) {
	var $node = $('<input type="checkbox" checked />');
	assert.strictEqual($node.prop('checked'), true, 'Get property');

	$node.prop('checked', false);
	assert.strictEqual($node.prop('checked'), false, 'Set property');

	$node.removeProp('checked');
	assert.strictEqual($node.prop('checked'), false, 'Remove property');

	$node = $('#test-link');
	assert.notEqual($node.prop('href'), './test', 'Get href property');
});


QUnit.test('Inner text', function(assert) {
	var $node = $('<div><p>test</p></div>');
	assert.strictEqual($node.text(), 'test', 'Get inner text');

	$node.text('<test again>');
	assert.strictEqual($node.text(), '<test again>', 'Set inner text');
});

QUnit.test('Inner html', function(assert) {
	var $node = $('<div><p>test</p></div>');
	assert.strictEqual($node.html().toLowerCase(), '<p>test</p>', 'Get inner html');

	$node.html('test again');
	assert.strictEqual($node.html().toLowerCase(), 'test again', 'Set inner html');
});


QUnit.test('Value', function(assert) {
	var $node = $('<input value="old content" />');
	assert.equal($node.val(), 'old content', 'Get value');
	$node.val('new content');
	assert.equal($node.val(), 'new content', 'Set value');
});