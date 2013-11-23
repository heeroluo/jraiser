/*!
 * jRaiser 2 Javascript Library
 * dom-event-arg - v1.0.0 (2013-11-23T10:49:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-event-arg",["base/1.0.x/",null],function(e,t,n){"use strict";function i(){return!1}function s(){return!0}var r=e("base/1.0.x/");return r.createClass(function(e,t){var n=this;if(e&&e.type){n.originalEvent=e,n.type=e.type;var r;n.isDefaultPrevented=e.defaultPrevented||e.defaultPrevented===r&&(e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault())?s:i}else n.type=e;if(t)for(var o in t)typeof t[o]!="function"&&(n[o]=t[o]);n.timeStamp=e&&e.timeStamp||+(new Date)},{preventDefault:function(){this.isDefaultPrevented=s;var e=this.originalEvent;if(!e)return;e.preventDefault?e.preventDefault():e.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=s;var e=this.originalEvent;if(!e)return;e.stopPropagation?e.stopPropagation():e.cancelBubble=!0},isDefaultPrevented:i,isPropagationStopped:i})})