var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('创建动画', function(assert) {
	var done = assert.async(2);

	var $test1 = $('<div class="square"></div>').appendTo('body');
	var DURATION = 500;
	var START_TIME_1 = +new Date;
	$test1.animate({
		width: 200
	}, {
		duration: DURATION,
		oncomplete: function() {
			assert.strictEqual(
				new Date - START_TIME_1 >= DURATION,
				true,
				'检查持续时间'
			);
			assert.strictEqual($test1.css('width'), '200px', '调用 oncomplete ，检查样式');
			$test1.remove();
			done();
		}
	}).eq(0);

	var $test2 = $('<div class="square" style="top: 220px;"></div>').appendTo('body');
	$test2.animate({
		width: 200
	}, true).then(function() {
		assert.strictEqual($test2.css('width'), '200px', '检查样式（promise）');
	}, function() {
		assert.ok(false);
	})['finally'](function() {
		$test2.remove();
		done();
	});
});

QUnit.test('停止动画', function(assert) {
	var done = assert.async(2);

	var $test1 = $('<div class="square"></div>').appendTo('body');
	$test1.animate({
		width: 200
	}, true).then(function() {
		assert.ok(false);
	}, function() {
		assert.strictEqual($test1.width() < 200, true, '动画已停止');
	})['finally'](function() {
		$test1.remove();
		done();
	});
	setTimeout(function() {
		$test1.stop();
	}, 150);

	var $test2 = $('<div class="square" style="top: 220px;"></div>').appendTo('body');
	$test2.animate({
		width: 200
	}, true).then(function() {
		assert.strictEqual($test2.width(), 200, '跳至最后一帧');
	}, function() {
		assert.ok(false);
	})['finally'](function() {
		$test2.remove();
		done();
	});
	setTimeout(function() {
		$test1.stop(true, true);
	}, 150);
});

QUnit.test('动画队列', function(assert) {
	var done = assert.async(3);

	var $test1 = $('<div class="square"></div>').appendTo('body');

	var DURATION_1 = 500, DURATION_2 = 1000;
	var START_TIME = new Date();

	$test1.animate({
		width: 300
	}, {
		duration: DURATION_1
	});

	$test1.animate({
		width: 100
	}, {
		duration: DURATION_2
	}, true).then(function() {
		var totalDuration = DURATION_1 + DURATION_2;
		assert.strictEqual(
			new Date - START_TIME >= totalDuration,
			true,
			'检查持续时间'
		);
		assert.strictEqual($test1.width(), 100, '检查样式');
	}, function() {
		assert.ok(false);
	})['finally'](function() {
		done();
		$test1.remove();
	});

	var $test2 = $('<div class="square" style="top: 220px;"></div>').appendTo('body');
	$test2.animate({ width: 300 }, {
		oncomplete: function() { assert.ok(false); }
	});
	$test2.animate({ width: 200 }, {
		oncomplete: function() { assert.ok(false); }
	});
	$test2.stop(true);
	setTimeout(function() {
		assert.ok($test2.width() < 100, '停止动画并清空队列');
		done();

		$test2.animate({ width: 300 });
		$test2.animate({ width: 200 });
		$test2.stop(true, true);
		setTimeout(function() {
			assert.strictEqual(
				$test2.width(),
				300,
				'停止动画，清空队列，并跳到当前动画最后一帧'
			);
			$test2.remove();
			done();
		}, 100);
	}, 100);
});