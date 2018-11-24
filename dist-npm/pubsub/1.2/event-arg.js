/**
 * 本模块提供事件参数类。
 * @module pubsub/1.2/event-arg
 * @catgory Infrastructure
 * @ignore
 */

var base = require('../../base/1.2/base');


function returnFalse() { return false; }
function returnTrue() { return true; }


/**
 * 事件参数类。
 * @class EventArg
 * @constructor
 * @exports
 * @param {String} type 事件类型。
 * @param {Object} [props] 事件属性。
 */
module.exports = base.createClass(function(type, props) {
	var t = this;

	base.extend(t, props);

	// 事件类型
	t.type = type;
	// 生成时间戳
	t.timeStamp = +new Date;
}, {
	/**
	 * 阻止事件默认行为。
	 * @for EventArg
	 * @method preventDefault
	 */
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;
	},

	/**
	 * 停止冒泡。
	 * @for EventArg
	 * @method stopPropagation
	 */
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;
	},

	/**
	 * 获取是否已阻止事件默认行为。
	 * @for EventArg
	 * @method isDefaultPrevented
	 * @return {Boolean} 是否已阻止默认事件行为。
	 */
	isDefaultPrevented: returnFalse,

	/**
	 * 获取是否已停止冒泡。
	 * @for EventArg
	 * @method isPropagationStopped
	 * @return {Boolean} 是否已停止冒泡。
	 */
	isPropagationStopped: returnFalse
});