var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('基本调用', function(assert) {
	var $node = $('<div class="test"></div>').appendTo('body');
	assert.strictEqual($node.hasClass('test'), true, 'Has class');

	$node.addClass('size abs');
	assert.strictEqual($node.hasClass('size'), true, 'Add class');
	assert.strictEqual($node.hasClass('abs'), true, 'Add class');

	assert.strictEqual($node.css('width'), '50px', 'Get class style');
	$node.css('width', '100px');
	assert.strictEqual($node.css('width'), '100px', 'Set inline style');

	$node.removeClass('abs');
	assert.strictEqual($node.hasClass('abs'), false, 'Remove class');

	$node.toggleClass('abs');
	assert.strictEqual($node.hasClass('abs'), true, 'Toggle class');

	$node.toggleClass('abs');
	assert.strictEqual($node.hasClass('abs'), false, 'Toggle class');
});

QUnit.test('尺寸', function(assert) {
	var $node = $('<div style="width: 100px; height: 50px; margin: 10px; padding: 20px; border: 5px solid; visibility: hidden;"></div>').appendTo('body');
	assert.strictEqual($node.innerWidth(), 140, 'Inner width');
	assert.strictEqual($node.innerHeight(), 90, 'Inner height');
	assert.strictEqual($node.outerWidth(), 150, 'Outer width');
	assert.strictEqual($node.outerHeight(), 100, 'Outer height');
	assert.strictEqual($node.outerWidth(true), 170, 'Outer width (include margin)');
	assert.strictEqual($node.outerHeight(true), 120, 'Outer height (include margin)');

	$node.hide();
	assert.strictEqual($node.css('display'), 'none', 'Hide');
	$node.show();
	assert.strictEqual($node.css('display'), 'block', 'Show');
	$node.toggle();
	assert.strictEqual($node.css('display'), 'none', 'Toggle');
	$node.toggle();
	assert.strictEqual($node.css('display'), 'block', 'Toggle');
});