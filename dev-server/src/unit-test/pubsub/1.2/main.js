var base = require('base/1.2/base');
var PubSub = require('pubsub/1.2/pubsub');
var QUnit = window.QUnit;


QUnit.test('基本调用', function(assert) {
	assert.expect(2);

	var Com = base.createClass(function() { }, null, PubSub);
	var com = new Com();

	function onRun(e) {
		assert.strictEqual(e.isDefaultPrevented(), false, 'Before preventing default');
		e.preventDefault();
		assert.strictEqual(e.isDefaultPrevented(), true, 'After preventing default');
	}
	com.on('run', onRun);
	com.trigger('run');

	com.off('run', onRun);
	com.trigger('run');

	com.on('run', function() { assert.ok(true); });
	com.on('run', function() { assert.ok(true); });
	com.off('run');
	com.trigger('run');

	com.on('run', function() { assert.ok(true); });
	com.on('stop', function() { assert.ok(true); });
	com.off();
	com.trigger('run');
	com.trigger('stop');
});