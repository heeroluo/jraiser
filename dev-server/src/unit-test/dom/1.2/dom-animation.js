var $ = require('dom/1.2/dom');
var QUnit = window.QUnit;


QUnit.test('基本调用', function(assert) {
	var _done = assert.async(), counter = 0;
	function done() {
		counter++;
		if (counter >= 3) { _done(); }
	}

	var DURATION = 500;

	var $test1 = $('<div class="square"></div>').appendTo('body');
	var START_TIME_1 = +new Date;
	$test1.animate({
		width: 200,
		height: 200
	}, {
		duration: DURATION,
		oncomplete: function() {
			assert.strictEqual(
				Math.abs(new Date - START_TIME_1 - DURATION) < DURATION * 0.15,
				true,
				'duration'
			);
			assert.strictEqual($test1.css('width'), '200px', 'oncomplete');
			done();
			$test1.remove();
		}
	}).eq(0);

	var $test2 = $('<div class="square" style="top: 220px;"></div>').appendTo('body');
	$test2.animate({
		width: 200,
		height: 200
	}, true).then(function() {
		assert.strictEqual($test2.css('width'), '200px', 'promise');
		done();
		$test2.remove();
	});

	var $test3 = $('<div class="square" style="top: 440px;"></div>').appendTo('body');
	$test3.animate({
		width: 200,
		height: 200
	}, {
		duration: DURATION
	}, true).then(function() {
		assert.strictEqual($test3.width() < 200, true, 'stop');
		done();
		$test3.remove();
	});
	setTimeout(function() {
		$test3.stop();
	}, 150);
});