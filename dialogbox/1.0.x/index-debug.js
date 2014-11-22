/*!
 * JRaiser 2 Javascript Library
 * dialogbox - v1.0.0 (2014-11-22T19:45:34+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 模拟对话框组件
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
	var doc = document.documentElement, which = direction === 'top' ? 'Height' : 'Width';
	return (doc['client' + which] - size) / 2;
}


/**
 * 模拟对话框组件类
 * @class DialogBox
 * @extends popuplayer/1.0.x/
 * @constructor
 * @exports
 * @param {Object} [options] 组件设置，详见popuplayer组件的设置
 *   @param {Object} [options.draggable] 拖动设置，详见draggable组件的设置
 *   @param {Object} [options.fixedLayer] 固定定位设置，详见fixedlayer组件的设置
 */
return widget.create(function(options) {
	var t = this, wrapper = t._wrapper = options.wrapper;

	// 修正从PopupLayer继承而来的内部属性
	t._popupContent = wrapper;
	delete t._popupTrigger;

	// 创建固定定位组件
	if (options.fixedLayer) {
		t._fixedLayer = new FixedLayer( base.mix({
			wrapper: wrapper,
			disabled: true
		}, options.fixedLayer, { overwrite: false }) );
	}
	// 创建拖动功能组件
	if (options.draggable) {
		t._draggable = new Draggable( base.mix({
			wrapper: wrapper,
			disabled: true
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
		this._wrapper.find('.dialogbox-close').click(this.close);
	},

	_destroy: function() {
		var t = this;
		PopupLayer.prototype._init.apply(t, arguments);
		t._wrapper.find('.dialogbox-close').off('click', t.close);
		if (t._fixedLayer) { t._fixedLayer.destroy(); }
		if (t._draggable) { t._draggable.destroy(); }
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
					disabled: false
				});
			}
			if (draggable) { draggable.init(); }
		} else {
			if (draggable) { draggable.destroy(); }
			if (fixedLayer) { fixedLayer.destroy(); }
		}
	}
}, {
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