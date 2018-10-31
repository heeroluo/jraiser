var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('位置', function(assert) {
	var parentId = $('#test-el-child').offsetParent().attr('id');
	assert.strictEqual(parentId, 'test-el', 'Offset parent');

	var offset = $('#test-el-child').offset();
	// body margin为8
	assert.strictEqual(offset.left, 8, 'Offset');

	var position = $('#test-el-child').position();
	assert.strictEqual(position.left == 0 && position.top == 0, true);
});

QUnit.test('滚动', function(assert) {
	var $target = $('#scroll-top-el');
	assert.strictEqual($target.scrollTop(), 0, 'Get scroll top');
	$target.scrollTop(100);
	assert.equal($target.scrollTop(), 100, 'Set scroll top');

	$target = $('#scroll-left-el');
	assert.equal($target.scrollLeft(), 0, 'Get scroll left');
	$target.scrollLeft(50);
	assert.equal($target.scrollLeft(), 50, 'Set scroll left');
});