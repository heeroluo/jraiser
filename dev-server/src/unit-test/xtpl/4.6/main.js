var XTpl = require('xtpl/4.6/xtpl');
var Promise = require('promise/1.2/promise');
var QUnit = window.QUnit;


QUnit.test('静态方法', function(assert) {
	var tpls = XTpl.fromScripts();
	assert.notEqual(tpls['test-loop'], null);
	assert.notEqual(tpls['test-inc'], null);
});

QUnit.test('实例方法', function(assert) {
	assert.expect(2);
	var done = assert.async();

	var xTpl = new XTpl({
		loadTpl: function(key) {
			return Promise.resolve(XTpl.fromScripts()[key]);
		}
	});

	var loopRendering = xTpl.render('test-loop', {
		list: ['a', 'b']
	}).then(function(html) {
		assert.strictEqual(html, '<div>a,0</div><div>b,1</div>', '循环渲染');
	});

	var incRendering = xTpl.render('test-inc', {
		list: ['a', 'b']
	}).then(function(html) {
		assert.strictEqual(html, '<div>a,0</div><div>b,1</div><p>Inc</p>', '嵌套渲染');
	});

	Promise.all([loopRendering, incRendering]).then(function() {
		done();
	});
});