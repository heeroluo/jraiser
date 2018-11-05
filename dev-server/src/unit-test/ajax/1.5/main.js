var Promise = require('promise/1.2/promise');
var ajax = require('ajax/1.5/ajax');
var QUnit = window.QUnit;


QUnit.test('getImage', function(assert) {
	assert.expect(2);
	var done = assert.async();

	Promise.all([
		ajax.getImage('./test.gif').then(function() {
			assert.ok(true, 'Get image succeeded');
		}),
		ajax.getImage('./error')['catch'](function() {
			assert.ok(true, 'Get image failed');
		})
	])['finally'](done);
});

QUnit.test('getScript', function(assert) {
	assert.expect(3);
	var done = assert.async();

	var logs = [];
	window.testGetScript = function(value) {
		logs.push(value);
	};

	ajax.getScript('/ajax/script/normal').then(function() {
		return ajax.getScript('/ajax/script/normal', {
			nocache: true
		});
	})['finally'](function() {
		assert.strictEqual(logs[0], undefined, '不包含防缓存时间戳');
		assert.strictEqual(isNaN(logs[1]), false, '包含防缓存时间戳');
	}).then(function() {
		return ajax.getScript('/ajax/script/timeout', {
			timeout: 1000
		});
	})['finally'](function() {
		assert.strictEqual(logs.length, 2, '超时');
		done();
	});
});

QUnit.test('jsonp', function(assert) {
	assert.expect(6);
	var done = assert.async();

	Promise.all([
		ajax.jsonp('/ajax/jsonp/normal', {
			data: {
				test: 1
			}
		}).spread(function(value) {
			assert.strictEqual(value[0], '1', '数据发送');
			assert.equal(value[1], null, '不包含防缓存时间戳');
		}),

		ajax.jsonp('/ajax/jsonp/normal', {
			data: {
				test: 2
			},
			nocache: true
		}).spread(function(value) {
			assert.strictEqual(value[0], '2', '数据发送');
			assert.strictEqual(isNaN(value[1]), false, '包含防缓存时间戳');
		}),

		ajax.jsonp('/ajax/jsonp/post', {
			data: {
				test: 3
			},
			method: 'post'
		}).spread(function(value) {
			assert.strictEqual(value, '3', 'POST数据');
		}),

		ajax.jsonp('/ajax/jsonp/timeout', {
			timeout: 1000,
			nocache: true
		})['catch'](function(e) {
			assert.strictEqual(e.isAJAXTimeout, true, '超时');
		})
	])['finally'](function() {
		done();
	});
});

QUnit.test('XMLHttpRequest基本调用', function(assert) {
	assert.expect(4);
	var done = assert.async();

	Promise.all([
		ajax.send({
			url: '/ajax/xhr/get',
			data: {
				id: 1
			}
		}).then(function(value) {
			assert.strictEqual(value.id, '1', 'Get');
		}),

		ajax.send({
			url: '/ajax/xhr/get',
			data: {
				id: 1
			},
			responseType: 'text'
		}).then(function(value) {
			assert.strictEqual(typeof value, 'string', 'Response type: text');
		}),

		ajax.send({
			url: '/ajax/xhr/post',
			method: 'post',
			data: { id: 2 }
		}).then(function(value) {
			assert.strictEqual(value.id, '2', 'Post form data');
		}),

		ajax.send({
			url: '/ajax/xhr/post',
			method: 'post',
			data: { id: 3 },
			requestType: 'json'
		}).then(function(value) {
			assert.strictEqual(value.id, 3, 'Post json data');
		})
	])['finally'](function() {
		done();
	});
});

QUnit.test('XMLHttpRequest(RESTful API)', function(assert) {
	var done = assert.async();

	Promise.all([
		ajax.send({
			url: '/ajax/xhr/put',
			method: 'put',
			data: { id: 1 },
			requestType: 'json'
		}).then(function(value) {
			assert.strictEqual(value.id, 1, 'Put form data');
		}),

		ajax.send({
			url: '/ajax/xhr/delete',
			method: 'delete',
			data: { id: 2 },
			requestType: 'json'
		}).then(function(value) {
			assert.strictEqual(value.id, '2', 'Delete form data');
		}),

		ajax.send({
			url: '/ajax/xhr/delete/error',
			method: 'delete',
			data: { id: 3 },
			requestType: 'json'
		})['catch'](function(e) {
			assert.strictEqual(e.data.message, 'Not allowed', 'Delete failed');
		})
	])['finally'](function() {
		done();
	});
});