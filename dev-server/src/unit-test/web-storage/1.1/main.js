var webStorage = require('web-storage/1.1/web-storage');
var QUnit = window.QUnit;


QUnit.test('读写', function(assert) {
	webStorage.set('testValue', '1');
	assert.strictEqual(webStorage.get('testValue'), '1', '值');

	var obj = {
		a: 1,
		b: 2
	};
	webStorage.set('testObj', obj);
	assert.deepEqual(webStorage.getAsJSON('testObj'), obj, '对象');

	webStorage.remove('testValue');
	webStorage.remove('testObj');
	assert.equal(webStorage.get('testValue'), null, '删除值');
	assert.equal(webStorage.get('testObj'), null, '删除对象');
});

QUnit.test('过期时间', function(assert) {
	var done = assert.async();

	var now = new Date();
	webStorage.set('testExpires', '1', new Date(now.getFullYear() + 1, 0, 1));
	webStorage.set('testExpires', '1', new Date(now.getFullYear() - 1, 0, 1));
	assert.equal(webStorage.get('testExpires'), null, '先设为未过期，再设为过期');

	webStorage.set('testExpires', '1', '1 sec');
	assert.strictEqual(webStorage.get('testExpires'), '1', '过期前');
	setTimeout(function() {
		assert.equal(webStorage.get('testExpires'), null, '过期后');
		done();
	}, 1200);
});