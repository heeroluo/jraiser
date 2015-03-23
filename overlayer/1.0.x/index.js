/*!
 * JRaiser 2 Javascript Library
 * overlayer - v1.0.0 (2014-07-03T12:33:38+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("overlayer/1.0.x/",["widget/1.0.x/","dom/1.0.x/"],function(e){"use strict";var i=e("base/1.0.x/"),t=e("widget/1.0.x/"),o=e("dom/1.0.x/"),s=/MSIE\s(\d+)/.test(window.navigator.userAgent)&&parseInt(RegExp.$1,10)<7;return t.create(function(){},{_init:function(e){var i=this,t=e.wrapper,a="BODY"===t.prop("tagName"),n=a&&!s,r=i._overlayer=o("<div></div>").css({top:0,left:0,position:n?"fixed":"absolute",display:"none",zIndex:e.zIndex}).on("click",function(){i.trigger("click")});n&&r.css({width:"100%",height:"100%"});var d,l=s&&e.useIframe!==!1||e.useIframe;if(d=l?o('<div style="width: 100%; height: 100%;"></div>'):r,d.css("backgroundColor",e.backgroundColor),e.className&&d.addClass(e.className),i.adjustSize=n?function(){}:function(){var e,o;if(a){var s=document.documentElement;e=Math.max(s.clientWidth,s.scrollWidth),o=Math.max(s.clientHeight,s.scrollHeight)}else e=t.get(0).scrollWidth,o=t.get(0).scrollHeight;i._layerWidth!==e&&(r.css("width",e),i._layerWidth=e),i._layerHeight!==o&&(r.css("height",o),i._layerHeight=o)},a||t.css("position","relative"),i.adjustSize(),n||o(window).on("resize",i.adjustSize),l){var c=o('<iframe style="width: 100%; height: 100%; position: absolute; left: 0; top: 0; z-index: -1;" frameborder="0" scrolling="no"></iframe>');r.append(c),r.append(d)}t.append(r),e.visible&&i.show()},_destroy:function(){var e=this;o(window).off("resize",e.adjustSize),delete e.adjustSize,e._overlayer.remove(),delete e._overlayer,delete e._layerWidth,delete e._layerHeight,delete e._visible},show:function(){this.adjustSize(),this._doAction(!0)},hide:function(){this._doAction(!1)},toggle:function(){this._visible?this.hide():this.show()},_doAction:function(e){if(e!==this._visible){var t=this,o=t.trigger(e?"beforeshow":"beforehide");if(!o.isDefaultPrevented()){var s=t._overlayer;if(s){e&&t.adjustSize();var a=t._options.fade;a?(e&&s.css({opacity:0,display:"block"}),s.animate({opacity:e?t._options.opacity:0,display:e?"block":"none"},i.mix({callback:function(){t._actionDone(e)}},a,{overwrite:!1}))):(s[e?"show":"hide"](),t._actionDone(e))}}}},_actionDone:function(e){this._visible=e,this.trigger(e?"aftershow":"afterhide")}},{opacity:.6,zIndex:1e3,backgroundColor:"black",className:"overlayer",visible:!1,fade:{}})});