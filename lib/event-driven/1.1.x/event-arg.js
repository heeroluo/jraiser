/*!
 * JRaiser 2 Javascript Library
 * event-arg - v1.1.0 (2015-06-01T11:19:11+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.1.x/event-arg",["base/1.1.x/"],function(t,e,n){"use strict";function i(){return!1}function a(){return!0}var r=t("base/1.1.x/");return r.createClass(function(t,e){var n=this;r.extend(n,e),n.type=t,n.timeStamp=+new Date},{preventDefault:function(){this.isDefaultPrevented=a},stopPropagation:function(){this.isPropagationStopped=a},isDefaultPrevented:i,isPropagationStopped:i})});