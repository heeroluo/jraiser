var cookie = require('cookie/1.1/cookie');
var QUnit = window.QUnit;


QUnit.test('get', function(assert) {
	document.cookie = 'case1-key=case1-value';
	assert.strictEqual(cookie.get('case1-key'), 'case1-value');
});

QUnit.test('set', function(assert) {
	var done = assert.async();

	cookie.set('case2-key', 'case2-value');
	assert.strictEqual(cookie.get('case2-key'), 'case2-value');

	cookie.set('case3-key', 'case3-value', { expires: 1000 });
	assert.strictEqual(cookie.get('case3-key'), 'case3-value', '未过期');
	setTimeout(function() {
		assert.equal(cookie.get('case3-key'), null, '已过期');
		done();
	}, 1200);
});

QUnit.test('remove', function(assert) {
	cookie.set('case4-key', 'case4-value');
	cookie.remove('case4-key');
	assert.equal(cookie.get('case4-key'), null);
});