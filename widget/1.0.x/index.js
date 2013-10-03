/*!
 * jRaiser 2 Javascript Library
 * event-driven - v1.0.0 (2013-01-09T10:16:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("event-driven/1.0.x/",null,function(e,t,n){"use strict";var r=e("base/1.0.x/"),i=e("dom/1.0.x/dom-event-arg");return r.createClass(function(){var e={};this.trigger=function(t,n){var r=e[t],s=new i(t,n);if(r)for(var o=0;o<r.length;o++)r[o].call(this,s);return s},this.on=function(t,n){return e[t]=e[t]||[],e[t].push(n),this},this.off=function(t,n){if(!arguments.length)e={};else if(!n)delete e[t];else{var r=e[t];if(r){for(var i=r.length-1;i>=0;i--)r[i]===n&&r.splice(i,1);r.length||delete e[t]}}return this}})});
/*!
 * jRaiser 2 Javascript Library
 * widget - v1.0.2 (2013-10-01T22:56:20+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("widget/1.0.x/",["base/1.0.x/","dom/1.0.x/dom-event-arg",null],function(e,t,n){"use strict";function o(e,t,n,i){i=i||s,i&&i.defaultOptions&&(n=r.mix(n||{},i.defaultOptions,{overwrite:!1}));var o=function(e){return r.extend({},n,e)},u=r.createClass(function(t){t&&"enable"in t&&(t.disabled=!t.enable,delete t.enable),t=this._options=o(t),e.call(this,t),t.disabled||this.init()},t,i,function(e){return e=o(e),e.disabled=!0,[e]});return u.defaultOptions=n,u}var r=e("base/1.0.x/"),i=e("event-driven/1.0.x/"),s=r.createClass(function(){},{init:function(){if(!this._inited){this._init(this._options);var e=this._options.events;if(e)for(var t in e)this.on(t,e[t]);this._inited=!0}},_init:function(e){},destroy:function(){this._inited&&(this._destroy(this._options),this.off(),delete this._inited)},_destroy:function(e){},options:function(e){this.destroy(),r.mix(this._options,e),this._options.disabled||this.init()}},i);t.WidgetBase=s,t.create=o})