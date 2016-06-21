/*!
 * JRaiser 2 Javascript Library
 * tabs@1.2.0 (2016-06-21T10:14:28+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("tabs/1.2.x/",null,function(e,t,a){"use strict";var n=(e("base/1.1.x/"),e("widget/1.1.x/")),s=window.location;return n.create({_init:function(e){var t=this;t._tabs="string"==typeof e.tabs?e.wrapper.find(e.tabs):e.tabs,t._panels="string"==typeof e.panels?e.wrapper.find(e.panels):e.panels,t._total=Math.min(t._tabs.length,t._panels.length),e.event&&t._onDOMEvent(t._tabs,e.event,function(e){t.activate(t._tabs.indexOf(this),e)});var a=s.hash.substr(1);e.useHashStorage&&a?t.activate(a):null!=e.active&&t.activate(e.active)},_destroy:function(){this.stop()},activate:function(e,t){var a=this,n=a._options;if("string"==typeof e){var i=a._panels.some(function(t,a){if(t.id===e||t.getAttribute("data-id")===e)return e=a,!0});i||(e=0)}var l=a._panels.eq(e),r=a._active,_={newTab:a._tabs.eq(e),newPanel:l,newActive:e,sourceEvent:t};if(null!=r&&(_.oldTab=a._tabs.eq(r),_.oldPanel=a._panels.eq(r),_.oldActive=r),!a._trigger("beforeactivate",_).isDefaultPrevented()){for(var o,v,c=0;c<a._total;c++)o=a._tabs.eq(c),v=a._panels.eq(c),c===e?(o.addClass(n.activeTabClass),v.addClass(n.activePanelClass),v.css(n.activePanelStyle)):(o.removeClass(n.activeTabClass),v.removeClass(n.activePanelClass),v.css(n.inactivePanelStyle));if(a._active=e,n.useHashStorage){var p=l.attr("data-id")||l.attr("id"),u=s.hash.substr(1);(0===e&&u&&u!==p||e>0&&u!==p)&&(s.hash=p)}a._trigger("activate",_)}},next:function(){var e=this;e._options.next&&e.activate(e._options.next.call(window,e._active,e._total))},prev:function(){var e=this;e._options.prev&&e.activate(e._options.prev.call(window,e._active,e._total))},play:function(){var e=this,t=e._options.playInterval;if(t&&!e._playTimer&&(e._playTimer=setInterval(function(){e.next()},t),!e._isPlaying)){var a=e._tabs.add(e._panels);e._onDOMEvent(a,"mouseenter",{id:"pause",fn:"pause"}),e._onDOMEvent(a,"mouseleave",{id:"play",fn:"play"}),e._isPlaying=!0}},pause:function(){this._playTimer&&(clearInterval(this._playTimer),delete this._playTimer)},stop:function(){var e=this;e.pause(),e._isPlaying&&(e._offDOMEvent(e._tabs,"mouseenter","pause"),e._offDOMEvent(e._panels,"mouseenter","pause"),e._offDOMEvent(e._tabs,"mouseleave","play"),e._offDOMEvent(e._panels,"mouseleave","play"),delete e._isPlaying)}},{tabs:".ui-tabs__tabs__item",panels:".ui-tabs__panels__item",active:0,event:"click",useHashStorage:!1,activeTabClass:"ui-tabs__tabs__item--active",activePanelClass:"ui-tabs__panels__item--active",activePanelStyle:{display:"block"},inactivePanelStyle:{display:"none"},next:function(e,t){return null==e?0:(e+1)%t},prev:function(e,t){if(null==e)return 0;var a=e-1;return a<0?t-a:a},playInterval:5e3})});
define("tabs/1.2.x/tabs",["dom/1.1.x/","widget/1.1.x/"],function(n,e,f){return n("./")});