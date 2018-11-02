var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


// 获取测试用的数据，四种类型String,Element,ArrayLike<Element>,DocumentFragment
function getTestData() {
	var str = '<div class="test"></div>';
	var el = document.createElement('div');
	el.className = 'test';
	var arr = [el.cloneNode()];
	var documentFragment = document.createDocumentFragment();
	documentFragment.appendChild(el.cloneNode());
	return [
		{
			type: 'String',
			value: str
		},
		{
			type: 'Element',
			value: el
		},
		{
			type: 'ArrayLike<Element>',
			value: arr
		},
		{
			type: 'DocumentFragment',
			value: documentFragment
		}
	];
}

QUnit.test('append', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$node.append(item.value);
		assert.strictEqual(
			$node.children().get(-1).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('appendTo', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$(item.value).appendTo($node);
		assert.strictEqual(
			$node.children().get(-1).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('prepend', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$node.prepend(item.value);
		assert.strictEqual(
			$node.children().get(0).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('prependTo', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$(item.value).prependTo($node);
		assert.strictEqual(
			$node.children().get(0).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('before', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$node.children().last().before(item.value);
		assert.strictEqual(
			$node.children().get(0).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('insertBefore', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$(item.value).insertBefore($node.children().last());
		assert.strictEqual(
			$node.children().get(0).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('after', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$node.children().first().after(item.value);
		assert.strictEqual(
			$node.children().get(-1).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('insertAfter', function(assert) {
	var $node = $('<div><div class="child"></div></div>');
	getTestData().forEach(function(item) {
		$(item.value).insertAfter($node.children().first());
		assert.strictEqual(
			$node.children().get(-1).className,
			'test',
			item.type + '类型测试'
		);
	});
	assert.strictEqual($node.children().length, 5);
});

QUnit.test('replaceWith', function(assert) {
	getTestData().forEach(function(item) {
		var $node = $('<div><div class="child"></div></div>');
		$node.children().first().replaceWith(item.value);
		assert.strictEqual(
			$node.children().prop('className'),
			'test',
			item.type + '类型测试'
		);
		assert.strictEqual($node.children().length, 1);
	});
});

QUnit.test('replaceAll', function(assert) {
	getTestData().forEach(function(item) {
		var $node = $('<div><div class="child"></div></div>');
		$(item.value).replaceAll($node.children());
		assert.strictEqual(
			$node.children().prop('className'),
			'test',
			item.type + '类型测试'
		);
		assert.strictEqual($node.children().length, 1);
	});
});

QUnit.test('detach', function(assert) {
	var $node = $('<div><p></p></div>');
	var $p = $node.children().eq(0).data('key', 'value');
	$p.detach();
	assert.strictEqual($node.children().length, 0, '节点已移除');
	assert.strictEqual($p.data('key'), 'value', '数据未删除');
});

QUnit.test('remove', function(assert) {
	var $node = $('<div><p></p></div>');
	var $p = $node.children().eq(0).data('key', 'value');
	$p.remove();
	assert.strictEqual($node.children().length, 0, '节点已移除');
	assert.strictEqual($p.data('key'), undefined, '数据已删除');
});

QUnit.test('empty', function(assert) {
	var $node = $('<div><p></p></div>');
	var $p = $node.children().eq(0).data('key', 'value');
	$node.empty();
	assert.strictEqual($node.children().length, 0, '节点已移除');
	assert.strictEqual($p.data('key'), undefined, '数据已删除');
});

QUnit.test('clone', function(assert) {
	var $node = $('<div><p></p></div>').data('key', 'value');
	$node.children().data('key2', 'value2');

	var $nodeCl1 = $node.clone();
	assert.strictEqual($nodeCl1.length, 1);
	assert.strictEqual($nodeCl1.data('key'), undefined, '未克隆节点数据');
	assert.strictEqual($nodeCl1.children().data('key2'), undefined, '未克隆后代节点数据');

	var $nodeCl2 = $node.clone(true);
	assert.strictEqual($nodeCl2.data('key'), 'value', '已克隆节点数据');
	assert.strictEqual($nodeCl2.children().data('key2'), undefined, '未克隆后代节点数据');

	var $nodeCl3 = $node.clone(true, true);
	assert.strictEqual($nodeCl3.data('key'), 'value', '已克隆节点数据');
	assert.strictEqual($nodeCl3.children().data('key2'), 'value2', '已克隆后代节点数据');
});