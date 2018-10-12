/**
 * 本模块提供DOM Ready状态监听接口。
 * @module dom/1.2/dom-ready
 * @catgory Infrastructure
 * @ignore
 */


/**
 * 添加DOM Ready事件回调。
 * @method domReady
 * @exports
 * @param {Function} ready 回调函数。
 */
module.exports = (function(ready) {
	/* eslint-disable */

	var fns = [], fn, f = false
		, doc = document
		, testEl = doc.documentElement
		, hack = testEl.doScroll
		, domContentLoaded = 'DOMContentLoaded'
		, addEventListener = 'addEventListener'
		, onreadystatechange = 'onreadystatechange'
		, readyState = 'readyState'
		, loaded = doc[readyState] !== 'loading'

	function flush(f) {
		loaded = 1
		while (f = fns.shift()) f()
	}

	doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
		doc.removeEventListener(domContentLoaded, fn, f)
		flush()
	}, f)

	hack && doc.attachEvent(onreadystatechange, fn = function () {
		if (doc[readyState] !== 'loading') {
			doc.detachEvent(onreadystatechange, fn)
			flush()
		}
	})

	return (ready = hack ?
		function (fn) {
			self != top ?
				loaded ? fn() : fns.push(fn) :
			function () {
				try {
					testEl.doScroll('left')
				} catch (e) {
					return setTimeout(function() { ready(fn) }, 50)
				}
				fn()
			}()
		} :
		function (fn) {
			loaded ? fn() : fns.push(fn)
		}
	)

	/* eslint-enable */
})();