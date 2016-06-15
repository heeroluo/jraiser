/*!
 * JRaiser 2 Mobile Javascript Library
 * web-storage - v1.0.0 (2016-04-24T15:52:23+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("web-storage/1.0.x/",null,function(e,t,r){"use strict";return{get:function(e){var t=sessionStorage.getItem(e);if(null==t){var r=localStorage.getItem(e);if(null!=r){try{r=JSON.parse(r)}catch(o){}r.expires&&new Date>r.expires?localStorage.removeItem(e):t=r.value}}return t},getAsJSON:function(e){var t=this.get(e);try{t=JSON.parse(t)}catch(r){t=null}return t},set:function(e,t,r){if(this.remove(e),t.constructor===Object&&(t=JSON.stringify(t)),r){var o={value:t};r>0&&(o.expires=+new Date+r);try{localStorage.setItem(e,JSON.stringify(o))}catch(s){}}else try{sessionStorage.setItem(e,t)}catch(s){}},remove:function(e){sessionStorage.removeItem(e),localStorage.removeItem(e)}}});