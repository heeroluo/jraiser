var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('index', function(assert) {
	assert.strictEqual($('#dom-traversal-index').index(), 2, '不传参');
	assert.strictEqual(
		$('#dom-traversal-index').index('.dom-traversal span'),
		2,
		'传入选择器'
	);
	assert.strictEqual(
		$('.dom-traversal span').index($('#dom-traversal-index')),
		2,
		'传入节点'
	);
});

QUnit.test('children', function(assert) {
	var $children = $('.dom-traversal').children();
	assert.strictEqual($children.length, 4);
});

QUnit.test('next', function(assert) {
	var $dom = $('#dom-traversal-index').next();
	assert.strictEqual($dom.index(), 3);
});

QUnit.test('nextAll', function(assert) {
	var $first = $('.dom-traversal span').eq(0);
	assert.strictEqual($first.nextAll().length, 3);
});

QUnit.test('prev', function(assert) {
	var $list = $('.dom-traversal span');
	var $last = $list.last();
	assert.strictEqual($last.prev().get(0).innerHTML, '3');
});

QUnit.test('prevAll', function(assert) {
	var $list = $('.dom-traversal span');
	var $last = $list.last();
	assert.strictEqual($last.prevAll().length, 3);
});

QUnit.test('parent', function(assert) {
	var $dom = $('#dom-traversal-index');
	assert.strictEqual($dom.parent().get(0).className, 'dom-traversal');
});

QUnit.test('parents', function(assert) {
	var $dom = $('#dom-traversal-index');
	function validate() {
		var node = $dom.get(0);
		return $dom.parents().every(function(item) {
			node = node.parentNode;
			return node === item;
		});
	}
	assert.strictEqual(validate(), true);
});

QUnit.test('siblings', function(assert) {
	assert.strictEqual($('#dom-traversal-index').siblings().length, 3);
});

QUnit.test('nextUntil', function(assert) {
	var $node = $('.dom-traversal').children().first();
	var $nexts = $node.nextUntil('#dom-traversal-index');
	assert.strictEqual($nexts.length, 1);
	assert.strictEqual($nexts.text(), '2');
});

QUnit.test('prevUntil', function(assert) {
	var $node = $('.dom-traversal').children().last();
	var $prevs = $node.prevUntil('.first');
	assert.strictEqual($prevs.length, 2);
	assert.strictEqual($prevs.text(), '3');
});

QUnit.test('parentsUntil', function(assert) {
	var $parents = $('#dom-traversal-index').parentsUntil('body');
	assert.strictEqual($parents.length, 2);
	assert.strictEqual($parents.get(0).className, 'dom-traversal');
});