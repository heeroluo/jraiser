/*!
 * jRaiser 2 Javascript Library
 * waterfall - v1.1.0 (2013-09-28T11:29:46+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 瀑布流布局组件
 * @module waterfall/1.1.x/
 * @category Widget
 */


var base = require('base/1.0.x/'),
	$ = require('dom/1.0.x/'),
	_ = require('underscore/1.5.x/'),
	tmpl = require('tmpl/1.0.x/'),
	ajax = require('ajax/1.1.x/'),
	widget = require('widget/1.0.x/');


// 获取动画样式前缀，为null时说明浏览器不支持动画样式
var stylePrefix = (function() {
	var div = document.createElement('div'),
		prefixes = ['Webkit', 'Moz', 'O', 'MS'],
		result;

	if ('transition' in div.style) {
		result = '';
	} else {
		for (var i = 0; i < prefixes.length; i++) {
			if ( (prefixes[i] + 'Transition') in div.style ) {
				result = prefixes[i];
				break;
			}
		}
	}

	div = null;

	return result;
})();

// transition-duration样式名
var TRANSITION_DURATION = stylePrefix ?
	stylePrefix + 'TransitionDuration' : 'transitionDuration';


// 每个img标签加载完成后执行回调
function onEachImageLoad(imgs, callback) {
	imgs.forEach(function(img) {
		if (img.loaded || img.complete) {
			callback();
		} else {
			img.onload = function() {
				this.onload = null;
				this.loaded = true;
				callback();
			};
		}
	});
}


/**
 * 瀑布流布局组件类
 * @class Waterfall
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.wrapper 瀑布流容器
 *   @param {String} options.dataURL 数据地址
 *   @param {String} [options.dataType='jsonp'] 数据类型，json或jsonp
 *   @param {Number} [options.page=1] 初始页码
 *   @param {Boolean} [options.fixedImgSize=true] 图片大小是否固定。
 *     如不固定，则布局必须等到图片加载完成才能确定
 *   @param {Function} [options.isEnd] 判断数据是否已到末尾的函数，返回true时表示数据已到末尾
 *   @param {Number} [options.gridWidth] 格子宽度，如不指定，则取现有第一个格子的宽度
 *   @param {String|Number} [options.prefetch] 当前屏底部距离容器底部多长距离时启用预加载。
 *     可以传入像素值（数字）或百分率（字符串）；不指定即不启用预加载
 *   @param {Boolean} [options.loadFirstPageOnInit=true] 初始化之后是否自动加载第一页数据
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		var t = this,
			wrapper = options.wrapper,
			grids = wrapper.children();

		t._loadingPage = options.page || 1;
		if (!grids.length) {
			grids = null;
			t._loadingPage--;
		}

		t._wrapper = wrapper.css({
			overflow: 'hidden',
			position: 'relative'
		});

		// 格子宽度
		t._gridWidth = options.gridWidth || (grids ? grids.outerWidth() : 0);
		// 行距
		t._rowSpacing = options.rowSpacing;

		var totalWidth = wrapper.outerWidth(),	// 容器总宽度
			totalCols = parseInt(totalWidth / t._gridWidth);	// 总列数

		// 把right转为left，以便对left使用动画
		if (grids) {
			grids.css('position', 'absolute');
			if (stylePrefix != null) {
				grids.css({
					left: totalWidth - t._gridWidth,
					right: 'auto'
				});
			}
		}
		
		// 列距（n列间有n-1段空白）
		t._colSpacing = (totalWidth - totalCols * t._gridWidth) / (totalCols - 1);
		// 记录每列高度
		t._cols = new Array(totalCols);
		for (var i = t._cols.length - 1; i >= 0; i--) {
			t._cols[i] = 0;
		}

		// 检查是否要加载下一页数据（容器最下方在当前屏）或
		// 预加载下一页数据（当前屏最下方离容器底部一定距离）
		t._checkMoreTrigger = _.debounce(function() {
			if (t._isDataLoading || t._isImgLoading || t._isEnd) { return; }

			var docElt = document.documentElement,
				currentPos = (docElt.scrollTop || window.pageYOffset || 0) + docElt.clientHeight,
				wrapperTop = wrapper.offset().top,
				wrapperHeight = wrapper.outerHeight();

			if (currentPos >= wrapperTop + wrapperHeight) {
				t.next();
			} else if (options.prefetch && !t._prefetchedData) {
				var prefetchPos = wrapperHeight - (/%$/.test(options.prefetch) ?
					parseFloat(options.prefetch, 10) / 100 * wrapperHeight : options.prefetch
				);
				if (currentPos >= wrapperTop + prefetchPos) {
					t._loadNext(true);
				}
			}
		}, 50);

		$(window).on('scroll resize', t._checkMoreTrigger);

		if (grids) {
			t._isDataLoading = true;
			t._renderingPage = 1;
			
			var render = function() {
				t.trigger('render', {
					grids: grids,
					page: t._renderingPage
				});
				t._showGrids(grids);
				t._isDataLoading = false;
				grids = null;
			};

			// 显示现有格子
			if (stylePrefix != null) {
				setTimeout(render, 0);
			} else {
				render();
			}
		} else {
			t._renderingPage = 0;
			if (options.loadFirstPageOnInit) {
				t.next();
			}
		}
	},

	_destory: function() {
		var t = this;

		delete t._wrapper;
		delete t._gridWidth;
		delete t._rowSpacing;
		delete t._colSpacing;
		delete t._cols;
		delete t._isImgLoading;
		delete t._isDataLoading;
		delete t._isPrefetching;
		delete t._prefetchedData;
		delete t._isEnd;
		delete t._loadingPage;
		delete t._renderingPage;

		$(window).off('scroll resize', t._checkMoreTrigger);
		delete t._checkMoreTrigger;
	},

	/**
	 * 加载下一页数据
	 * @method _loadNext
	 * @protected
	 * @for Waterfall
	 * @param {Boolean} isPrefetch 是否预加载数据
	 */
	_loadNext: function(isPrefetch) {
		var t = this;
		if (t._isDataLoading || t._isEnd) { return; }

		/**
		 * 开始加载数据时触发
		 * @event beforeload
		 * @for Waterfall
		 * @param {Object} e 事件参数
		 *   @param {Number} e.page 页码
		 *   @param {Boolean} e.isPrefetch 是否预加载数据
		 */
		var e = t.trigger('beforeload', {
			page: t._loadingPage + 1,
			isPrefetch: isPrefetch
		});

		if ( e.isDefaultPrevented() ) { return; }

		t._isDataLoading = true;
		t._isPrefetching = isPrefetch;

		ajax.send({
			url: t._options.dataURL,
			data: { page: ++t._loadingPage },
			dataType: t._options.dataType,
			onsuccess: function(result) { t._completeLoading(result); }
		});
	},

	/**
	 * 完成数据加载后调用此方法
	 * @method _completeLoading
	 * @for Waterfall
	 * @protected
	 * @param {Object} result 格子数据
	 */
	_completeLoading: function(result) {
		var t = this;

		/**
		 * 完成数据加载后触发
		 * @event load
		 * @for Waterfall
		 * @param {Object} e 事件对象
		 *   @param {NodeList} e.data 加载到的数据
		 */
		t.trigger('load', {
			data: result
		});

		if (result) {
			// 判断是否最后一页
			if ( t._options.isEnd && t._options.isEnd.call(t, result) ) {
				t._isEnd = true;
				
				/**
				 * 加载完最后一页数据后触发
				 * @event end
				 * @for Waterfall
				 */
				t.trigger('end');
			} else {
				if (t._isPrefetching) {
					t._prefetchedData = result;
					t._checkMoreTrigger();
				} else {
					t._add(result);
				}
			}
		}
		t._isPrefetching = false;
		t._isDataLoading = false;
	},

	/**
	 * 显示下一页
	 * @method next
	 * @for Waterfall
	 */
	next: function() {
		if (this._prefetchedData) {
			this._add(this._prefetchedData);
			delete this._prefetchedData;
		} else {
			this._loadNext();
		}
	},

	/**
	 * 获取当前高度最小列的序号（从0开始）
	 * @method minColIndex
	 * @for Waterfall
	 * @return {Number} 当前高度最小列的序号
	 */
	minColIndex: function() {
		var cols = this._cols;
		if (cols) {
			var min = 0;
			for (var i = 1; i < cols.length; i++) {
				if (cols[i] < cols[min]) {
					min = i;
				}
			}

			return min;
		}
	},

	/**
	 * 显示已经添加的格子
	 * @method _showGrids
	 * @for Waterfall
	 * @protected
	 * @param {NodeList} grids 格子节点集合
	 */
	_showGrids: function(grids) {
		var t = this,
			imgs = grids.find('img'),
			gridTotal = grids.length,
			pos = -1;

		var setGridsPosition = function(newPos) {
			if (newPos != null && newPos > pos) {
				var min, grid;
				for (var i = pos + 1; i <= newPos; i++) {
					min = t.minColIndex();
					grid = grids.eq(i);
					if (stylePrefix != null) {
						grid.css(TRANSITION_DURATION, '1s');
					} else {
						grid.css('right', 'auto');
					}
					grid.css({
						top: t._cols[min],
						left: (t._gridWidth + t._colSpacing) * min
					});

					t._cols[min] += grid.outerHeight() + t._rowSpacing;
				}

				/**
				 * 当前页格子中的部分img标签加载完成后触发
				 * @event imageload
				 * @for Waterfall
				 * @param {Object} e 事件对象
				 *   @param {NodeList} e.grids img标签加载完成的格子节点列表
				 */
				t.trigger('imageload', {
					grids: grids.slice(pos, newPos)
				});

				pos = newPos;

				t._wrapper.height( Math.max.apply(Math, t._cols) );

				if (newPos >= gridTotal - 1) {
					t._isImgLoading = false;

					/**
					 * 当前页格子中的所有img标签加载完成后触发
					 * @event allimagesload
					 * @for Waterfall
					 * @param {Object} e 事件对象
					 *   @param {NodeList} e.grids 当前页格子节点列表
					 */
					t.trigger('allimagesload', {
						grids: grids
					});

					t._checkMoreTrigger();
				}
			}
		};

		if (t._options.fixedImgSize) {
			setGridsPosition(gridTotal - 1);
		} else {
			t._isImgLoading = true;
			onEachImageLoad(imgs, function() {
				var newPos;
				grids.each(function(grid, i) {
					if (pos >= 0 && i <= pos) { return; }

					// 检查单个格子的图片是否已加载完毕
					var isReady = true;
					var imgs = grid.getElementsByTagName('img');
					for (var j = imgs.length - 1; j >= 0; j--) {
						isReady = isReady && (imgs[j].loaded || imgs[j].complete);
						if (!isReady) { return isReady; }
					}

					newPos = i;
				});

				setGridsPosition(newPos);
			});
		}
	},

	/**
	 * 添加格子
	 * @method _add
	 * @for Waterfall
	 * @protected
	 * @param {Object} result 格子数据
	 */
	_add: function(result) {
		var t = this, col = t._cols.length - 1;

		var html = tmpl.render(t._options.template, result);
		if (!html) { return; }

		var grids = $(html).css('position', 'absolute');
		if (stylePrefix != null) {
			grids.css({
				top: t._cols[col],
				left: (t._gridWidth + t._colSpacing) * col
			});
		}

		html = null;

		t._wrapper.append(grids);

		/**
		 * 格子添加到页面上时触发（此时格子中的图片可能没加载完）
		 * @event render
		 * @for Waterfall
		 * @param {Object} e 事件对象
		 *   @param {NodeList} e.grids 格子节点集合
		 *   @param {Number} e.page 当前页码
		 */
		t.trigger('render', {
			grids: grids,
			page: ++t._renderingPage
		});

		var max = 0;
		grids.forEach(function(grid) {
			var height = grids.outerHeight();
			if (height > max) { max = height; }
		});

		// 大致上设定一个高度，使格子不致于超出容器
		t._wrapper.css('height',
			(max + t._rowSpacing) * 1.5 + Math.max.apply(Math, t._cols)
		);

		t._showGrids(grids);
	},

	/**
	 * 清空瀑布流内容
	 * @method clear
	 * @for Waterfall
	 */
	clear: function() {
		if (this._wrapper) {
			this._wrapper.empty().css('height', 0);
			for (var i = this._cols.length - 1; i >= 0; i--) {
				this._cols[i] = 0;
			}
		}
	}
}, {
	dataType: 'jsonp',
	fixedImgSize: true,
	loadFirstPageOnInit: true,
	isEnd: function(result) { return !result.data || !result.data.length; }
});

});