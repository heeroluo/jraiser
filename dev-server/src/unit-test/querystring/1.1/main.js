var qs = require('querystring/1.1/querystring');
var QUnit = window.QUnit;


var obj1 = {
	id: '0',
	str: 'hello'
};
var obj2 = {
	id: '0',
	str: 'hello',
	empty: ''
};
var str1 = 'id=0&str=hello';
var str2 = 'id=0&str=hello&empty=';
var options = {
	ignoreEmpty: true
};


QUnit.test('parse', function(assert) {
	assert.deepEqual(qs.parse(str1), obj1);
	assert.deepEqual(qs.parse(str2), obj2, '空值处理');
	assert.deepEqual(qs.parse(str2, options), obj1, '忽略空值');
});

QUnit.test('stringify', function(assert) {
	assert.strictEqual(qs.stringify(obj1), str1);
	assert.strictEqual(qs.stringify(obj2), str2, '空值处理');
	assert.strictEqual(
		qs.stringify(obj2, options),
		str1,
		'忽略空值'
	);
});

QUnit.test('append', function(assert) {
	var url1 = 'https://heeroluo.github.io/jraiser/';
	var url2 = 'https://heeroluo.github.io/jraiser/?author=Heero.Law';

	assert.strictEqual(
		qs.append(url1, obj1),
		url1 + '?id=0&str=hello',
		'无参数URL'
	);

	assert.strictEqual(
		qs.append(url2, obj1),
		url2 + '&id=0&str=hello',
		'带参数URL'
	);
});