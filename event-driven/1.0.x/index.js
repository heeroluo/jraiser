/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.0.0 (2013-01-09T10:16:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.0.x/",["base/1.0.x/","dom/1.0.x/dom-event-arg",null],function(e){"use strict";var t=e("base/1.0.x/"),n=e("dom/1.0.x/dom-event-arg");return t.createClass(function(){var e={};this.trigger=function(t,r){var i=e[t],s=new n(t,r);if(i)for(var f=0;f<i.length;f++)i[f].call(this,s);return s},this.on=function(t,n){return e[t]=e[t]||[],e[t].push(n),this},this.off=function(t,n){if(arguments.length)if(n){var r=e[t];if(r){for(var i=r.length-1;i>=0;i--)r[i]===n&&r.splice(i,1);r.length||delete e[t]}}else delete e[t];else e={};return this}})});