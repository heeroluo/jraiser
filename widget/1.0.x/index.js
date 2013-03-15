/*!
 * jRaiser 2 Javascript Library
 * dom-event-arg - v1.0.0 (2013-01-09T09:45:06+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-event-arg",["base/1.0.x/"],function(e,t,n){"use strict";function i(){return!1}function s(){return!0}var r=e("base/1.0.x/"),o=r.createClass(function(e,t){var n=this;e&&e.type?(n.originalEvent=e,n.type=e.type,n.isDefaultPrevented=e.defaultPrevented||e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault()?s:i):n.type=e;if(t)for(var r in t)typeof t[r]!="function"&&(n[r]=t[r]);n.timeStamp=e&&e.timeStamp||+(new Date)},{preventDefault:function(){this.isDefaultPrevented=s;var e=this.originalEvent;if(!e)return;e.preventDefault?e.preventDefault():e.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=s;var e=this.originalEvent;if(!e)return;e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0},isDefaultPrevented:i,isPropagationStopped:i});n.exports=o});
/*!
 * jRaiser 2 Javascript Library
 * event-driven - v1.0.0 (2013-01-09T10:16:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.0.x/",["base/1.0.x/","dom/1.0.x/dom-event-arg"],function(e,t,n){"use strict";var r=e("base/1.0.x/"),i=e("dom/1.0.x/dom-event-arg");return r.createClass(function(){var e={};this.trigger=function(t,n){var r=e[t],s=new i(t,n);if(r)for(var o=0;o<r.length;o++)r[o].call(this,s);return s},this.on=function(t,n){return e[t]=e[t]||[],e[t].push(n),this},this.off=function(t,n){if(!arguments.length)e={};else if(!n)delete e[t];else{var r=e[t];if(r){for(var i=r.length-1;i>=0;i--)r[i]===n&&r.splice(i,1);r.length||delete e[t]}}return this}})});
/*!
 * jRaiser 2 Javascript Library
 * widget - v1.0.0 (2013-03-15T14:58:31+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("widget/1.0.x/",["base/1.0.x/","event-driven/1.0.x/"],function(e,t,n){"use strict";function o(e,t,n,i){i=i||s,i&&i.defaultOptions&&(n=r.mix(n||{},i.defaultOptions,{overwrite:!1}));var o=function(e){return r.extend({enable:!0},n,e)},u=r.createClass(function(t){t=this._options=o(t),e.call(this,t),t.enable&&this.init()},t,i,function(e){return e=o(e),e.enable=!1,[e]});return u.defaultOptions=n,u}var r=e("base/1.0.x/"),i=e("event-driven/1.0.x/"),s=r.createClass(function(){},{init:function(){this._inited||(this._init(this._options),this._inited=!0)},_init:function(e){},destroy:function(){this._inited&&(this._destroy(this._options),delete this._inited)},_destroy:function(e){},options:function(e){this.destroy(),r.mix(this._options,e),this._options.enable&&this.init()}},i);t.WidgetBase=s,t.create=o})