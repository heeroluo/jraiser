var tween = require('tween/1.0/tween');
var Promise = require('promise/1.2/promise');
var QUnit = window.QUnit;


QUnit.test('创建补间', function(assert) {
	assert.expect(3);
	var done = assert.async();

	var END_VALUE_1 = 10;
	var DURATION_1 = 400;
	var value1;
	var tween1 = tween.create({
		startValue: 0,
		endValue: END_VALUE_1,
		duration: DURATION_1,
		frame: function(value) {
			value1 = value;
		}
	}).then(function() {
		assert.strictEqual(value1, END_VALUE_1, '值变化');
	});

	var END_VALUE_2 = [10, 20, 30];
	var DURATION_2 = 400;
	var value2;
	var tween2 = tween.create({
		startValue: [1, 2, 3],
		endValue: END_VALUE_2,
		duration: DURATION_2,
		frame: function(value) {
			value2 = value;
		}
	}).then(function() {
		assert.deepEqual(value2, END_VALUE_2, '数组元素变化');
	});

	var END_VALUE_3 = {
		a: 10,
		b: 20,
		c: 30
	};
	var value3 = {};
	var tween3 = tween.create({
		startValue: {
			a: 1,
			b: 2,
			c: 3
		},
		endValue: END_VALUE_3,
		frame: function(value, key) {
			value3[key] = value;
		}
	}).then(function() {
		assert.deepEqual(value3, END_VALUE_3, '对象属性变化');
	});

	Promise.all([
		tween1,
		tween2,
		tween3
	]).then(function() {
		done();
	});
});


QUnit.test('移除补间', function(assert) {
	var done = assert.async();

	var END_VALUE = 10;

	var val1, taskId1;
	var tween1 = tween.create({
		startValue: 0,
		endValue: END_VALUE,
		frame: function(value) {
			val1 = value;
		},
		receiveId: function(id) {
			taskId1 = id;
		}
	}).then(function() {
		assert.strictEqual(val1 < END_VALUE, true);
	});

	var val2, taskId2;
	var tween2 = tween.create({
		startValue: 0,
		endValue: END_VALUE,
		frame: function(value) {
			val2 = value;
		},
		receiveId: function(id) {
			taskId2 = id;
		}
	}).then(function() {
		assert.strictEqual(val2, END_VALUE, 'jumpToEnd');
	});

	setTimeout(function() {
		tween.remove(taskId1);
		tween.remove(taskId2, true);
	}, 	50);

	Promise.all([tween1, tween2]).then(function() {
		done();
	});
});