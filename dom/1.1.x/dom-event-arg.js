/*!
 * JRaiser 2 Javascript Library
 * dom-event-arg - v1.1.0 (2014-12-08T16:26:30+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.1.x/dom-event-arg",["base/1.0.x/",null],function(t){"use strict";function e(){return!1}function n(){return!0}var a,i=t("base/1.0.x/");return i.createClass(function(t,i){var r=this;if(t&&t.type?(r.originalEvent=t,r.type=t.type,r.isDefaultPrevented=t.defaultPrevented||t.defaultPrevented===a&&t.returnValue===!1?n:e,r.timeStamp=t.timeStamp):r.type=t,i)for(var o in i)"function"!=typeof i[o]&&(r[o]=i[o]);r.timeStamp=r.timeStamp||+new Date},{preventDefault:function(){this.isDefaultPrevented=n;var t=this.originalEvent;t&&(t.preventDefault?t.preventDefault():t.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=n;var t=this.originalEvent;t&&(t.stopPropagation?t.stopPropagation():t.cancelBubble=!0)},isDefaultPrevented:e,isPropagationStopped:e})});