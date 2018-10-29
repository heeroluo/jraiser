var Tmpl = require('tmpl/2.2/tmpl');
var QUnit = window.QUnit;


QUnit.test('静态方法', function(assert) {
	var tpls = Tmpl.fromScripts();
	assert.notEqual(tpls['test-if'], null);
	assert.notEqual(tpls['test-loop'], null);

	assert.strictEqual(
		Tmpl.escape('<div class="hello">\'abc\'</div>'),
		'&lt;div class=&quot;hello&quot;&gt;&#x27;abc&#x27;&lt;/div&gt;'
	);
});

QUnit.test('实例方法', function(assert) {
	var tmpl = new Tmpl();

	assert.strictEqual(tmpl.has('test-loop'), false, 'has');
	tmpl.add(Tmpl.fromScripts());
	assert.strictEqual(tmpl.has('test-loop'), true, 'has');

	assert.strictEqual(
		tmpl.render('test-loop', { value: 'test' }),
		'<div>test,0</div><div>test,1</div>',
		'循环渲染'
	);
	assert.strictEqual(
		tmpl.render('test-if', { value: '<p>test</p>' }),
		'<div><p>test</p></div>',
		'条件渲染'
	);

	tmpl.clear();
	assert.strictEqual(tmpl.has('test-loop'), false, 'clear');
});