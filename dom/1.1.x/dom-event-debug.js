/*!
 * JRaiser 2 Javascript Library
 * dom-event - v1.1.0 (2014-12-15T10:35:06+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供节点事件操作接口
 * @module dom/1.1.x/dom-event
 * @catgory Infrastructure
 * @ignore
 */


var base = require('base/1.0.x/'),
	domBase = require('./dom-base'),
	domData = require('./dom-data'),
	Sizzle = require('./sizzle'),
	EventArg = require('./dom-event-arg');


// 是否支持事件操作
function supportEvent(node) {
	return domBase.isWindow(node) || domBase.isHTMLElement(node, true);
}


var addEventListener, removeEventListener, isOldIE;
if (document.addEventListener) {
	addEventListener = function(node, type, listener) {
		node.addEventListener(type, listener, false);
	};
	removeEventListener = function(node, type, listener) {
		node.removeEventListener(type, listener, false);
	};
} else if (document.attachEvent) {
	// for old ie
	addEventListener = function(node, type, listener) {
		node.attachEvent('on' + type, listener);
	};
	removeEventListener = function(node, type, listener) {
		node.detachEvent('on' + type, listener);
	};
	isOldIE = true;
}


// 存放各种事件类型对应的事件类别（在文件末尾赋值）
var eventTypes = { };

// 事件参数标准化 (modify from jQuery)
var eventArgNormalizer = {
	props: 'altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' '),

	keyHook: {
		props: 'char charCode key keyCode'.split(' '),
		filter: function(event, original) {
			// Add which for key events
			if (event.which == null) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHook: {
		props: 'button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement touches'.split(' '),
		filter: function(event, original) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement,
				touches = original.touches;

			// Compatible with touchevents
			if (touches && touches.length === 1) {
				event.pageX = touches[0].pageX;
				event.pageY = touches[0].pageY;
			}

			// Calculate pageX/Y if missing and clientX/Y available
			if (event.pageX == null && original.clientX != null) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = original.clientY +
					(doc && doc.scrollTop || body && body.scrollTop || 0 ) -
					(doc && doc.clientTop || body && body.clientTop || 0);
			}

			// Add relatedTarget, if necessary
			if (!event.relatedTarget && fromElement) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && !base.isUndefined(button) ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},
	
	fix: function(e) {
		if (e instanceof EventArg) { return e; }

		var originalEvent = e,
			hook = this[eventTypes[e.type] + 'Hook'],
			props = hook && hook.props ? this.props.concat(hook.props) : this.props;

		e = base.mix(new EventArg(e), originalEvent, {
			whiteList: props
		});

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if (!e.target) {
			e.target = originalEvent.srcElement || document;
		}
		// Target should not be a text node (#504, Safari)
		if (e.target.nodeType === 3) {
			e.target = e.target.parentNode;
		}

		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
		e.metaKey = !!e.metaKey;

		return hook && hook.filter? hook.filter(e, originalEvent) : e;
	}
};


// 特殊事件处理
var eventHooks = { };

// 旧版本的Firefox、Chrome、Opera不支持mouseenter、mouseleave
if ( !('onmouseenter' in document) ) {
	base.each({
		mouseenter: 'mouseover',
		mouseleave: 'mouseout'
	}, function(fix, orig) {
		eventHooks[orig] = {
			bindType: fix,
			handle: function(obj, e) {
				var related = e.relatedTarget, result;
				if ( !e || !related || ( related !== this && !Sizzle.contains(this, related) ) ) {
					// 记录原来的事件类型
					var temp = e.type;

					e.type = orig;
					result = obj.handler.call(this, e);

					// 恢复原来的事件类型
					e.type = temp;
				}
				return result;
			}
		};
	});
}


// 记录阻止哪些节点哪些事件的回调函数执行，用于调用trigger时防止回调函数重复执行
var listenerBlocker = domData.createDataSpace({ cloneable: false });

// 本函数从事件存储空间中找到对应的事件队列，逐个遍历，如符合条件则执行
// 只有本函数才会直接绑定为事件监听
function dispatch(e) {
	// 处理事件参数兼容性
	e = eventArgNormalizer.fix(e);

	var node = this, eventType = e.type, eventTarget = e.target;

	if ( listenerBlocker.get(node, eventType) ||
		( eventTarget && listenerBlocker.get(eventTarget, eventType) )
	) {
		return;
	}

	var bindType = eventHooks[eventType] ? eventHooks[eventType].bindType : eventType,
		listeners = listenerManager.get(node, bindType);

	if (listeners) {
		// 遍历回调函数
		listeners.forEach(function(listener) {
			// 检查是否要触发的事件类型
			if (e.isTrigger && listener.trueType !== eventType) { return; }

			var thisObj;
			// 事件代理
			if (listener.delegator) {
				var temp = eventTarget;
				while (temp && temp !== node) {
					if ( Sizzle.matchesSelector(temp, listener.delegator) ) {
						thisObj = temp;
						e.delegateTarget = node;
						break;
					} else {
						// 事件目标可能是委托元素的后代节点；
						// 当目标无法匹配委托选择器时，再匹配其祖先元素
						temp = temp.parentNode;
					}
				}
				if (!thisObj) { return; }
			} else {
				thisObj = node;
			}

			if ( !('data' in e) ) { e.data = listener.data; }

			var result = listener.handle ?
				listener.handle.call(thisObj, listener, e) : listener.handler.call(thisObj, e);

			if (result === false) { e.preventDefault(); }
			if (e.cancelBubble === true) { e.stopPropagation(); }
		});
	}
}


// 管理监听的添加与移除
var listenerManager = (function() {
	var DISPATCH_KEY = '__dispatch__';

	// 绑定事件分发函数
	function bindDispatch(node, bindType, listenerSpace) {
		var myDispatch;
		if (isOldIE) {
			// 旧版本IE下监听函数的this不是指向元素本身，通过闭包解决
			var myDispatch = function() { return dispatch.apply(node, arguments); };
			// 使用一个特殊的key（DISPATCH_KEY）记录事件分发函数（移除监听的时候要用）
			listenerSpace.set(node, DISPATCH_KEY, myDispatch);
		} else {
			myDispatch = dispatch;
		}

		addEventListener(node, bindType, myDispatch);
	}

	// 创建存放监听器的数据空间
	var listenerSpace = domData.createDataSpace({
		onClone: function(targetNode, sourceNode) {
			var sourceDispatch;
			if (isOldIE) { sourceDispatch = this.get(sourceNode, DISPATCH_KEY); }

			this.keys(targetNode).forEach(function(bindType) {				
				if (bindType !== DISPATCH_KEY) {
					if (sourceDispatch) {
						// 旧版本IE下，克隆节点会把监听函数一起克隆，要将其移除
						removeEventListener(targetNode, bindType, sourceDispatch);
					}

					bindDispatch(targetNode, bindType, this);
				}
			});
		}
	});

	return {
		// 添加监听器
		add: function(node, type, obj) {
			if (type === DISPATCH_KEY) { return; }

			var listeners = listenerSpace.get(node, type);
			if (!listeners) {
				// 创建事件监听器队列
				listeners = [ ];
				listenerSpace.set(node, type, listeners);

				bindDispatch(node, type, listenerSpace);	
			}

			listeners.push(obj);
		},

		// 获取监听器
		get: function(node, type) { return listenerSpace.get(node, type); },

		// 移除监听器
		remove: function(node, trueType, bindType, handler) {
			// 1 - 移除trueType类型的所有监听器
			// 2 - 移除node的所有监听器
			var removeWay;

			if (handler) {
				var listeners = listenerSpace.get(node, bindType);
				if (listeners) {
					for (var i = listeners.length - 1; i >= 0; i--) {
						if (listeners[i].trueType === trueType && listeners[i].handler === handler) {
							listeners.splice(i, 1);
						}
					}
					// 队列为空，可以整个移除
					if (!listeners.length) { removeWay = 1; }
				}
			} else if (trueType) {
				// 指定了事件类型但没有指定监听函数的情况下，移除该事件类型的整个队列
				removeWay = 1;
			} else {
				// 移除所有事件类型的队列
				removeWay = 2;
			}

			var myDispatch = listenerSpace.get(node, DISPATCH_KEY) || dispatch;

			if (removeWay === 1) {
				listenerSpace.remove(node, bindType);
				removeEventListener(node, bindType, myDispatch);
			}

			var allTypes = listenerSpace.keys(node);
			if (allTypes) {
				if (removeWay === 2) {
					allTypes.forEach(function(type) {
						if (type !== DISPATCH_KEY) {
							removeEventListener(node, type, myDispatch);
						}
					});
					allTypes = null;
				} else if (allTypes.length === 1 && allTypes[0] === DISPATCH_KEY) {
					allTypes = null;
				}
			}

			if (!allTypes) { listenerSpace.clear(node); }
		}
	};
})();


// 在指定节点上注册事件监听
function on(node, types, handler, options) {
	if ( !supportEvent(node) ) { return; }

	types.forEach(function(type) {
		var hook = eventHooks[type];

		listenerManager.add(node, hook ? hook.bindType : type, base.mix({
			handler: handler,
			trueType: type,
			handle: hook ? hook.handle : null
		}, options, {
			overwrite: false
		}) );
	});
}

// 在指定节点上移除事件监听
function off(node, types, handler) {
	if ( !supportEvent(node) ) { return; }

	if (types) {
		types.forEach(function(type) {
			var hook = eventHooks[type];
			listenerManager.remove(node, type, hook ? hook.bindType : type, handler);
		});
	} else {
		listenerManager.remove(node);
	}
}


// 各种事件类别下的默认参数
var defaultEventArgs = {
	key: {
		view: window,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		keyCode: 0,
		charCode: 0
	},

	mouse: {
		view: window,
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		button: 0
	},

	ui: {
		view: window
	}
};

// 默认动作触发
var defaultActions = {
	focus: true,
	blur: true,
	click: true,
	reset: true,
	submit: true
};

// 冒泡的事件
var bubbleEvents = {
	scroll: true, resize: true, select: true, error: true,
	reset: true, submit: true, change: true, abort: true
};


// 模拟事件触发
function trigger(node, type, options) {
	if ( !supportEvent(node) || !type ) { return; }

	options = options || { };

	var e = eventArgNormalizer.fix(
			base.extend({
				type: type,
				target: node
			}, defaultEventArgs[ eventTypes[type] ])
		),
		originalNode = node,
		bubbles = options.bubbles != null ? options.bubbles : bubbleEvents[type];

	// isTrigger表示模拟触发
	e.isTrigger = true;

	if (options.data != null) { e.data = options.data; }

	// 触发事件并冒泡
	do {
		dispatch.call(node, e);
		node = node.parentNode;
	} while ( bubbles && node && !e.isPropagationStopped() );

	if ( defaultActions[type] && !e.isDefaultPrevented() && (type in originalNode) ) {
		// 防止重复执行事件处理函数
		listenerBlocker.set(originalNode, type, true);
		originalNode[type]();
		listenerBlocker.remove(originalNode, type);
	}
}


var shortcuts = {
	/**
	 * 在当前所有节点上注册事件监听
	 * @method on
	 * @for NodeList
	 * @param {String|Array<String>} types 事件类型。多个事件类型用空格隔开，或者以数组传入
	 * @param {Function(e)} handler 监听函数
	 * @param {Object} [options] 其他参数
	 *   @param {String} [options.delegator] 委托方。可接受后代元素委托
	 *   @param {Any} [options.data] 额外传入的数据。可通过事件对象的data属性获得
	 * @return {NodeList} 当前节点集合
	 */
	on: function(types, handler, options) {
		types = domBase.splitBySpace(types);
		if (types) {
			this.forEach(function(node) {
				on(node, types, handler, options);
			});
		}

		return this;
	},

	/**
	 * 在指定节点上移除事件监听
	 * @method off
	 * @for NodeList
	 * @param {String|Array<String>} [types] 事件类型。
	 *   多个事件类型用空格隔开，或者以数组传入；
	 *   如果为空，则移除所有事件类型的监听函数
	 * @param {Function} [handler] 回调函数。
	 *   如果为空，则移除指定事件类型的所有监听函数
	 * @return {NodeList} 当前节点集合
	 */
	off: function(types, handler) {
		if (types) { types = domBase.splitBySpace(types); }
		this.forEach(function(node) {
			off(node, types, handler);
		});

		return this;
	},

	/**
	 * 模拟事件触发
	 * @method trigger
	 * @for NodeList
	 * @param {String} type 事件类型
	 * @param {Object} [options] 参数设置
	 *   @param {Boolean} [options.bubbles] 是否冒泡
	 *   @param {Mixed} [options.data] 事件数据
	 * @return {NodeList} 当前节点集合
	 */
	trigger: function(type, options) {
		this.forEach(function(node) {
			trigger(node, type, options);
		});

		return this;
	}
};

var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu|touch)|click/;
('blur focus load resize scroll unload click dblclick mousedown mouseup mousemove ' +
'mouseover mouseout mouseenter mouseleave touchstart touchmove touchend change select ' +
'submit keydown keypress keyup error contextmenu').split(' ').forEach(function(type) {
	if ( rkeyEvent.test(type) ) {
		bubbleEvents[type] = true;
		eventTypes[type] = 'key';
	} else if ( rmouseEvent.test(type) ) {
		bubbleEvents[type] = true;
		eventTypes[type] = 'mouse';
	}

	// 快捷事件调用
	shortcuts[type] = function(handler, options) {
		return arguments.length ? this.on(type, handler, options) : this.trigger(type);
	};
});


return {
	shortcuts: shortcuts
};

});