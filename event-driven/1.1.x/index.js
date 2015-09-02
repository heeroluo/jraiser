/*!
 * JRaiser 2 Javascript Library
 * event-arg - v1.1.0 (2015-06-01T11:19:11+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.1.x/event-arg",null,function(t,e,n){"use strict";function i(){return!1}function a(){return!0}var r=t("base/1.1.x/");return r.createClass(function(t,e){var n=this;r.extend(n,e),n.type=t,n.timeStamp=+new Date},{preventDefault:function(){this.isDefaultPrevented=a},stopPropagation:function(){this.isPropagationStopped=a},isDefaultPrevented:i,isPropagationStopped:i})});
/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.1.0 (2015-09-02T14:42:46+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.1.x/",["base/1.1.x/"],function(e,t,n){"use strict";var r=e("base/1.1.x/"),s=e("./event-arg");return r.createClass(function(e){if(this.__eventHandlers={},e)for(var t in e)e.hasOwnProperty(t)&&e[t]&&this.on(t,e[t])},{trigger:function(e,t,n){var r=this.__eventHandlers[e],a=new s(e,t);if(r)for(var i=0;i<r.length;i++)r[i].call(n||this,a);return a},on:function(e,t){var n=this.__eventHandlers;return n[e]=n[e]||[],n[e].push(t),this},off:function(e,t){switch(arguments.length){case 0:this.__eventHandlers={};break;case 1:delete this.__eventHandlers[e];break;case 2:var n=this.__eventHandlers[e];if(n){for(var r=n.length-1;r>=0;r--)n[r]===t&&n.splice(r,1);n.length||delete this.__eventHandlers[e]}}return this}})});