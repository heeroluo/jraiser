var base = require('base/1.2/base');
var QUnit = window.QUnit;


function getType(value) {
	var toString = Object.prototype.toString;
	var type = '';
	var valueDisplay = JSON.stringify(value);
	if (typeof value === 'object') {
		switch (toString.call(value)) {
			case '[object Array]':
				type = 'array';
				break;
			case '[object Date]':
				type = 'date';
				break;
			default:
				type = 'object';
		}
	} else {
		type = typeof value;
	}
	return type + '(' + valueDisplay + ')';
}


QUnit.test('isFunction', function(assert) {
	assert.strictEqual(base.isFunction(function() {}), true);

	[
		0,
		'',
		undefined,
		[],
		{}
	].forEach(function(item) {
		assert.strictEqual(
			base.isFunction(item),
			false,
			getType(item)
		);
	});
});

QUnit.test('isDate', function(assert) {
	assert.strictEqual(base.isDate(new Date()), true);

	[
		0,
		'',
		undefined,
		[],
		{}
	].forEach(function(item) {
		assert.strictEqual(
			base.isDate(item),
			false,
			getType(item)
		);
	});
});

QUnit.test('isObject', function(assert) {
	assert.strictEqual(base.isObject({}), true);

	[
		[],
		0,
		undefined,
		'',
		new Date()
	].forEach(function(item) {
		assert.strictEqual(
			base.isObject(item),
			false,
			getType(item)
		);
	});
});

QUnit.test('isEmptyObject', function(assert) {
	[
		undefined,
		null,
		{},
		0
	].forEach(function(item) {
		assert.strictEqual(
			base.isEmptyObject(item),
			true,
			'okay-' + getType(item)
		);
	});

	var date = new Date();
	date.someProp = 1;
	[
		{ a: 1 },
		date
	].forEach(function(item) {
		assert.strictEqual(
			base.isEmptyObject(item),
			false,
			getType(item)
		);
	});
});

QUnit.test('each', function(assert) {
	var passValueA = {};
	var passValueB = {
		a: 1,
		b: 2,
		c: 3
	};
	var passValueC = [1, 2, 3];

	function test(obj) {
		var result = [];
		base.each(obj, function(value, key) {
			result.push(value, key);
		});
		return result.join(',');
	}

	assert.strictEqual(test(passValueA), '', 'okay-空对象');
	assert.strictEqual(test(passValueB), '1,a,2,b,3,c', 'okay-对象');
	assert.strictEqual(test(passValueC), '1,0,2,1,3,2', 'okay-数组');
});

QUnit.test('toArray', function(assert) {
	var passValueA = {
		0: 0,
		1: 1,
		2: 2,
		length: 3
	};
	var passValueB = {
		length: 0
	};
	var result = base.toArray(passValueA);
	assert.deepEqual(result, [0, 1, 2], true);
	assert.deepEqual(base.toArray(passValueB), [], true, 'okay-空数组');
});

QUnit.test('mergeArray', function(assert) {
	var arr1 = [1, 2], arr2 = [3, 4];
	var arr3 = base.mergeArray(arr1, arr2);

	assert.deepEqual(arr3, [1, 2, 3, 4], true);
	assert.strictEqual(arr1, arr3, '目标数组与返回值一致');
});

QUnit.test('randomStr', function(assert) {
	var PREFIX = 'prefix-';
	var value = base.randomStr(PREFIX);

	assert.strictEqual(value.indexOf(PREFIX) === 0, true, '前缀验证');
	assert.strictEqual(value !== base.randomStr(PREFIX), true, '随机性验证');
	assert.strictEqual(value.length, 16 + PREFIX.length, '长度测试');
});

QUnit.test('createClass', function(assert) {
	var logs = [];

	var ClassA = base.createClass(function(arg) {
		logs.push(arg);
	}, {
		aMethod: function() {
			return 'a';
		}
	});
	ClassA.staticMethod = function() {};

	var ClassB = base.createClass(function() {
		logs.push('B');
	}, {
		aMethod: function() {
			return 'b';
		}
	}, ClassA, ['A']);

	var instance = new ClassB();
	assert.deepEqual(logs, ['A', 'B'], '执行顺序');
	assert.strictEqual(instance.aMethod(), 'b', '方法调用');
	assert.notEqual(ClassB.staticMethod, null, '静态方法');
});