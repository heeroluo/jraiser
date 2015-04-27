/*!
 * JRaiser 2 Javascript Library
 * event-arg - v1.0.0 (2015-04-27T10:34:29+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.1.x/event-arg",null,function(t,e,n){"use strict";function i(){return!1}function a(){return!0}var r=t("base/1.1.x/");return r.createClass(function(t,e){var n=this;r.extend(n,e),n.type=t,n.timeStamp=+new Date},{preventDefault:function(){this.isDefaultPrevented=a},stopPropagation:function(){this.isPropagationStopped=a},isDefaultPrevented:i,isPropagationStopped:i})});
/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.1.0 (2015-04-27T10:32:48+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.1.x/",["base/1.1.x/"],function(e,t,r){"use strict";var n=e("base/1.1.x/"),i=e("./event-arg");return n.createClass(function(){var e={};this.trigger=function(t,r){var n=e[t],s=new i(t,r);if(n)for(var f=0;f<n.length;f++)n[f].call(this,s);return s},this.on=function(t,r){return e[t]=e[t]||[],n.isArray(r)?n.merge(e[t],r):e[t].push(r),this},this.off=function(t,r){if(arguments.length)if(r){var n=e[t];if(n){for(var i=n.length-1;i>=0;i--)n[i]===r&&n.splice(i,1);n.length||delete e[t]}}else delete e[t];else e={};return this}})});