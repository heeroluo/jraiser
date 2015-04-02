/*!
 * JRaiser 2 Javascript Library
 * dom-event-arg - v1.0.0 (2013-11-23T10:49:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-event-arg",["base/1.0.x/"],function(e,t,n){"use strict";function a(){return!1}function r(){return!0}var i=e("base/1.0.x/");return i.createClass(function(e,t){var n=this;if(e&&e.type){n.originalEvent=e,n.type=e.type;var i;n.isDefaultPrevented=e.defaultPrevented||e.defaultPrevented===i&&(e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault())?r:a}else n.type=e;if(t)for(var o in t)"function"!=typeof t[o]&&(n[o]=t[o]);n.timeStamp=e&&e.timeStamp||+new Date},{preventDefault:function(){this.isDefaultPrevented=r;var e=this.originalEvent;e&&(e.preventDefault?e.preventDefault():e.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=r;var e=this.originalEvent;e&&(e.stopPropagation?e.stopPropagation():e.cancelBubble=!0)},isDefaultPrevented:a,isPropagationStopped:a})});