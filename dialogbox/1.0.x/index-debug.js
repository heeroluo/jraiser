/*!
 * jRaiser 2 Javascript Library
 * dialogbox - v1.0.0 (2013-01-08T22:18:26+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本部件提供模拟对话框功能
 * @module dialogbox/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	$style = require('dom/1.0.x/dom-style'),
	widget = require('widget/1.0.x/'),
	PopupLayer = require('popuplayer/1.0.x/'),
	FixedLayer = require('fixedlayer/1.0.x/'),
	Draggable = require('draggable/1.0.x/');


// 返回居中对齐的坐标值
function alignCenter(wrapper, size, direction) {
	var doc = document.documentElement,
		which = direction === 'top' ? 'Height' : 'Width',
		val = (doc['client' + which] - size) / 2;

	if (wrapper.css('position') !== 'fixed') {
		val = val + $style.getScroll(window, direction) -
			wrapper.offsetParent().offset()[direction] || 0;
	}

	return val;
}


/**
 * 对话框UI部件
 * @class DialogBox
 * @extends popuplayer/1.0.x/
 * @constructor
 * @exports
 * @param {Object} [options] 部件设置，详见ui-popuplayer部件的设置
 *   @param {Object} [options.draggable] 拖动设置，详见draggable部件的设置
 *   @param {Object} [options.fixedLayer] 固定定位设置，详见fixedlayer部件的设置
 */
return widget.create(function(options) {
	var t = this, wrapper = t._wrapper = options.wrapper;

	// 修正从PopupLayer继承而来的内部属性
	t._popupContent = wrapper;
	delete t._popupTrigger;

	// 创建固定定位部件
	if (options.fixedLayer) {
		t._fixedLayer = new FixedLayer( base.mix({
			wrapper: wrapper,
			enable: false
		}, options.fixedLayer, { overwrite: false }) );
	}
	// 创建拖动功能部件
	if (options.draggable) {
		t._draggable = new Draggable( base.mix({
			wrapper: wrapper,
			enable: false
		}, options.draggable, { overwrite: false }) );

		if (t._fixedLayer) {
			// 开始拖动时暂停固定定位，停止拖动后重新定位
			t._draggable.on('dragstart', function() {
				t._fixedLayer.destroy();
			}).on('dragend', function() {
				t._fixedLayer.reposition();
			});
		}
	}
}, {
	_init: function() {
		PopupLayer.prototype._init.apply(this, arguments);
		this._wrapper.find('.ui-dialogbox-close').click(this.close);
	},

	_destroy: function() {
		PopupLayer.prototype._init.apply(this, arguments);
		this._wrapper.find('.ui-dialogbox-close').off('click', this.close);
	},

	_computeStyle: function(styleName) {
		var t = this, rCenter = /^center$/i;

		PopupLayer.prototype._computeStyle.apply(t, arguments);

		var styleOpt = t._options[styleName], style = t['_' + styleName];
		// 居中对齐
		if ( rCenter.test(styleOpt.left) || rCenter.test(styleOpt.right) ) {
			style.left = alignCenter(t._wrapper, style.width, 'left');
		}
		if ( rCenter.test(styleOpt.top) || rCenter.test(styleOpt.bottom) ) {
			style.top = alignCenter(t._wrapper, style.height, 'top');
		}
	},

	_actionDone: function(isPopup) {
		var fixedLayer = this._fixedLayer, draggable = this._draggable;

		PopupLayer.prototype._actionDone.apply(this, arguments);

		if (isPopup) {
			if (fixedLayer) {
				fixedLayer.options({
					position: base.mix({ }, this._popupStyle, {
						whiteList: ['top', 'bottom', 'left', 'right']
					}),
					enable: true
				});
			}
			if (draggable) { draggable.init(); }
		} else {
			if (draggable) { draggable.destroy(); }
			if (fixedLayer) { fixedLayer.destroy(); }
		}
	}
}, {
	popupClass: 'ui-dialogbox-popup',
	popupWhen: '',
	closeWhen: '',
	popupStyle: {
		width: '',
		height: '',
		top: 'center',
		left: 'center',
		visibility: 'visible'
	},
	closedStyle: {
		width: 0,
		height: 0,
		top: 'center',
		left: 'center',
		visibility: 'hidden'
	},
	draggable: { },
	fixedLayer: { }
}, PopupLayer);

});