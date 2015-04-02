/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.0.0 (2013-01-09T10:16:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.0.x/",null,function(e,t,n){"use strict";var r=e("base/1.0.x/"),i=e("dom/1.0.x/dom-event-arg");return r.createClass(function(){var e={};this.trigger=function(t,n){var r=e[t],s=new i(t,n);if(r)for(var f=0;f<r.length;f++)r[f].call(this,s);return s},this.on=function(t,n){return e[t]=e[t]||[],e[t].push(n),this},this.off=function(t,n){if(arguments.length)if(n){var r=e[t];if(r){for(var i=r.length-1;i>=0;i--)r[i]===n&&r.splice(i,1);r.length||delete e[t]}}else delete e[t];else e={};return this}})});
/*!
 * JRaiser 2 Javascript Library
 * widget - v1.0.2 (2013-10-16T18:03:41+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("widget/1.0.x/",["base/1.0.x/","dom/1.0.x/dom-event-arg"],function(i,t,n){"use strict";function e(i,t,n,e){e=e||d,e&&e.defaultOptions&&(n=s.mix(n||{},e.defaultOptions,{overwrite:!1}));var o=function(i){return s.extend({},n,i)},a=s.createClass(function(t){t&&"enable"in t&&(t.disabled=!t.enable,delete t.enable),t=this._options=o(t),i.call(this,t),t.disabled||this.init()},t,e,function(i){return i=o(i),i.disabled=!0,[i]});return a.defaultOptions=n,a}var s=i("base/1.0.x/"),o=i("event-driven/1.0.x/"),d=s.createClass(function(){},{init:function(){if(!this._inited){var i=this._options.events;if(i)for(var t in i)this.on(t,i[t]);this._init(this._options),this._inited=!0}},_init:function(i){},destroy:function(){this._inited&&(this._destroy(this._options),this.off(),delete this._inited)},_destroy:function(i){},options:function(i){this.destroy(),s.mix(this._options,i),this._options.disabled||this.init()}},o);t.WidgetBase=d,t.create=e});