/*!
 * JRaiser 2 Javascript Library
 * dom-event-arg - v1.1.1 (2015-04-27T15:37:23+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.1.x/dom-event-arg",["base/1.1.x/"],function(t,e,n){"use strict";function a(){return!1}function i(){return!0}var r,o=t("base/1.1.x/");return o.createClass(function(t,e){var n=this;if(t&&t.type?(n.originalEvent=t,n.type=t.type,n.isDefaultPrevented=t.defaultPrevented||t.defaultPrevented===r&&t.returnValue===!1?i:a,n.timeStamp=t.timeStamp):n.type=t,e)for(var o in e)"function"!=typeof e[o]&&(n[o]=e[o]);n.timeStamp=n.timeStamp||+new Date},{preventDefault:function(){this.isDefaultPrevented=i;var t=this.originalEvent;t&&(t.preventDefault?t.preventDefault():t.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=i;var t=this.originalEvent;t&&(t.stopPropagation?t.stopPropagation():t.cancelBubble=!0)},isDefaultPrevented:a,isPropagationStopped:a})});