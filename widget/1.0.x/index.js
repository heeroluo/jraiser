/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.0.0 (2013-01-09T10:16:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.0.x/",null,function(e){"use strict";var t=e("base/1.0.x/"),n=e("dom/1.0.x/dom-event-arg");return t.createClass(function(){var e={};this.trigger=function(t,r){var i=e[t],s=new n(t,r);if(i)for(var f=0;f<i.length;f++)i[f].call(this,s);return s},this.on=function(t,n){return e[t]=e[t]||[],e[t].push(n),this},this.off=function(t,n){if(arguments.length)if(n){var r=e[t];if(r){for(var i=r.length-1;i>=0;i--)r[i]===n&&r.splice(i,1);r.length||delete e[t]}}else delete e[t];else e={};return this}})});
/*!
 * JRaiser 2 Javascript Library
 * widget - v1.0.2 (2013-10-16T18:03:41+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("widget/1.0.x/",["base/1.0.x/","dom/1.0.x/dom-event-arg",null],function(i,t){"use strict";function n(i,t,n,s){s=s||o,s&&s.defaultOptions&&(n=e.mix(n||{},s.defaultOptions,{overwrite:!1}));var d=function(i){return e.extend({},n,i)},a=e.createClass(function(t){t&&"enable"in t&&(t.disabled=!t.enable,delete t.enable),t=this._options=d(t),i.call(this,t),t.disabled||this.init()},t,s,function(i){return i=d(i),i.disabled=!0,[i]});return a.defaultOptions=n,a}var e=i("base/1.0.x/"),s=i("event-driven/1.0.x/"),o=e.createClass(function(){},{init:function(){if(!this._inited){var i=this._options.events;if(i)for(var t in i)this.on(t,i[t]);this._init(this._options),this._inited=!0}},_init:function(){},destroy:function(){this._inited&&(this._destroy(this._options),this.off(),delete this._inited)},_destroy:function(){},options:function(i){this.destroy(),e.mix(this._options,i),this._options.disabled||this.init()}},s);t.WidgetBase=o,t.create=n});