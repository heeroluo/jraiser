var Promise = require('promise/1.2/promise');
var QUnit = window.QUnit;


QUnit.test('基本调用', function(assert) {
	assert.expect(5);
	var done = assert.async();

	var logs1 = [];
	logs1.push(1);
	var promise1 = new Promise(function(resolve) {
		logs1.push(2);
		resolve();
	}).then(function() {
		logs1.push(3);
		return 'p1';
	})['finally'](function() {
		logs1.push(4);
	});
	logs1.push(5);

	var logs2 = [];
	var promise2 = new Promise(function(resolve, reject) {
		reject(new Error('error'));
	}).then(function() {
		logs2.push(1);
	}, function(err) {
		logs2.push(err.message);
		return 'p2';
	})['finally'](function() {
		logs2.push(2);
	});

	Promise.all([
		promise1,
		promise2
	]).then(function(values) {
		assert.strictEqual(values.join(','), 'p1,p2', 'Promise.all');
		return values;
	}).spread(function(v1, v2) {
		assert.strictEqual(v1, 'p1', 'spread');
		assert.strictEqual(v2, 'p2', 'spread');
	})['finally'](function() {
		assert.strictEqual(logs1.join(','), '1,2,5,3,4', '执行顺序');
		assert.strictEqual(logs2.join(','), 'error,2', 'reject');
		done();
	});
});

QUnit.test('race', function(assert) {
	assert.expect(1);

	var done = assert.async();
	Promise.race([
		new Promise(function(resolve) {
			setTimeout(function() {
				resolve('p1');
			}, 300);
		}),
		new Promise(function(resolve) {
			setTimeout(function() {
				resolve('p2');
			}, 100);
		})
	]).then(function(val) {
		assert.strictEqual(val, 'p2');
		done();
	});
});

QUnit.test('series', function(assert) {
	assert.expect(2);
	var done = assert.async();

	var logs = [];
	var promise1 = Promise.series([
		function() {
			return Promise.resolve(1);
		},
		function(val) {
			logs.push(val);
			return Promise.resolve(2);
		}
	]).then(function(val) {
		logs.push(val);
		assert.deepEqual(logs, [1, 2], '值传递');
	});

	var result;
	var promise2 = Promise.series([
		function() {
			return Promise.resolve(1);
		},
		function() {
			return Promise.reject(new Error('error'));
		},
		function() {
			return Promise.resolve(3);
		}
	]).then(function(val) {
		result = val;
	}, function(err) {
		result = err.message;
	})['finally'](function() {
		assert.strictEqual(result, 'error', '异常中断');
	});

	Promise.all([promise1, promise2])['finally'](done);
});