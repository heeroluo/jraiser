/*!
 * JRaiser 2 Javascript Library
 * scrollbar - v1.0.2 (2014-08-21T10:56:42+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("scrollbar/1.0.x/",["dom/1.0.x/","widget/1.0.x/","uadetector/1.0.x/","draggable/1.0.x/"],function(l){"use strict";var o,r=(l("base/1.0.x/"),l("dom/1.0.x/")),e=l("widget/1.0.x/"),s=l("draggable/1.0.x/"),c='<div class="scrollbar"><div class="scrollbar-track"><div class="scrollbar-thumb"></div></div></div>';o="onmousewheel"in document.body?"mousewheel":"DOMMouseScroll";var t="webkitOverflowScrolling"in document.body.style;return e.create(function(){},{_init:function(l){var e=l.axis;if(!e)throw new Error("please specify the axis of scrollbar");e=e.toLowerCase();var s=this;if(s._axis=e,s._scrollBody=l.scrollBody,t){s._overflowStyle={webkitOverflowScrolling:"touch"};var a;switch(s._axis){case"x":s._overflowStyle.overflowX="scroll",a="scrollLeft";break;case"y":s._overflowStyle.overflowY="scroll",a="scrollTop"}return s._onOverflowScroll=function(){s.trigger("scroll",{scrollBodyPosition:this[a]})},void s._scrollBody.parent().css(s._overflowStyle).on("scroll",s._onOverflowScroll)}switch(s._scrollOuter=l.scrollOuter,s._scrollbar=r(c).click(function(l){if(l.stopPropagation(),s._scrollbarEnabled&&!r(l.target).hasClass("scrollbar-thumb")){var o;switch(s._axis){case"x":o=(l.offsetX-s._scrollThumb.width()/2)/s._scrollbar.outerWidth()*s._scrollBody.outerWidth(!0);break;case"y":o=(l.offsetY-s._scrollThumb.height()/2)/s._scrollbar.outerHeight()*s._scrollBody.outerHeight(!0)}s.scrollTo(o)}}),e){case"x":s._scrollbar.addClass("scrollbar-horizontal");break;case"y":s._scrollbar.addClass("scrollbar-vertical")}s._scrollThumb=s._scrollbar.find(".scrollbar-thumb"),s._scrollOuter.append(s._scrollbar),l.mouseWheelStep&&(s.onMouseWheel=function(o){var r=o.originalEvent,e=1;r.wheelDelta?r.wheelDelta>0&&(e=-1):r.detail&&r.detail<0&&(e=-1);var c=l.scrollPageWhenEnd&&(!s._scrollbarEnabled||l.scrollPageWhenEnd&&null!=s._scrollBodyPosition&&(-1===e&&s._scrollBodyPosition<=0||1===e&&s._scrollBodyPosition>=s._scrollBodyLimit));c||(s.scroll(e*l.mouseWheelStep),o.preventDefault())},s._scrollOuter.on(o,s.onMouseWheel)),s.refresh()},_destroy:function(){var l=this;delete l._axis,l.onMouseWheel&&(l._scrollOuter.off(o,l.onMouseWheel),delete l.onMouseWheel),l._scrollOuter.removeClass("scrollbar-unscrollable"),delete l._scrollOuter,l._draggable&&(l._draggable.destroy(),delete l._draggable),l._scrollbar&&(l._scrollbar.remove(),delete l._scrollbar);var r=l._scrollBody.parent();if(l._overflowStyle){for(var e in l._overflowStyle)l._overflowStyle[e]="";r.css(l._overflowStyle)}l._onOverflowScroll&&(r.off("scroll",l._onOverflowScroll),delete l._onOverflowScroll),delete l._bodySize,delete l._viewportSize,delete l._scrollbarEnabled,delete l._scrollThumbLimit,delete l._scrollBodyLimit,delete l._scrollBodyPosition,delete l._scrollThumb,delete l._scrollBody},refresh:function(){var l,o,r=this;switch(r._axis){case"x":l=r._scrollBody.outerWidth(!0),o=r._scrollBody.parent().outerWidth();break;case"y":l=r._scrollBody.outerHeight(!0),o=r._scrollBody.parent().outerHeight()}if(r._bodySize=l,r._viewportSize=o,r.trigger("beforerefresh",{viewportSize:o,scrollBodySize:l,scrollbar:r._scrollbar}),l>o){var e,c,t=o/l;switch(r._axis){case"x":e=r._scrollbar.outerWidth(),c=Math.max(t*e,r._options.minThumbSize),r._scrollThumb.width(c),r._scrollThumbLimit=e-c;break;case"y":e=r._scrollbar.outerHeight(),c=Math.max(t*e,r._options.minThumbSize),r._scrollThumb.height(c),r._scrollThumbLimit=e-c}r._scrollBodyLimit=l-o,r._draggable=r._draggable||new s({wrapper:r._scrollThumb,boundary:r._scrollbar.find(".scrollbar-track"),events:{drag:function(l){var o;switch(r._axis){case"x":o=l.position.left;break;case"y":o=l.position.top}r.scrollTo(r._scrollBodyLimit*o/r._scrollThumbLimit)}}}),r._scrollbar.removeClass("scrollbar-disabled"),r._scrollOuter.removeClass("scrollbar-unscrollable"),r._scrollbarEnabled=!0,r.scroll(0)}else r._draggable&&(r._draggable.destroy(),delete r._draggable),r._scrollbar.addClass("scrollbar-disabled"),r._scrollOuter.addClass("scrollbar-unscrollable"),r._scrollbarEnabled=!1,r.scrollTo(0);return r.trigger("afterrefresh",{viewportSize:o,scrollBodySize:l,scrollbar:r._scrollbar,scrollbarEnabled:r._scrollbarEnabled}),r._scrollbarEnabled},viewportSize:function(){return this._viewportSize},bodySize:function(){return this._bodySize},scroll:function(l){var o,r=this;switch(r._axis){case"x":o="left";break;case"y":o="top"}r.scrollTo(-(parseFloat(r._scrollBody.css(o))||0)+l)},scrollTo:function(l){var o=this;if(o._scrollbarEnabled||!(l>0)){0>l?l=0:l>o._scrollBodyLimit&&(l=o._scrollBodyLimit);var r;switch(o._axis){case"x":r="left";break;case"y":r="top"}o._scrollBody.css(r,-l),o._scrollBodyPosition=l;var e=o._scrollBodyLimit?l/o._scrollBodyLimit*o._scrollThumbLimit:0;o._scrollThumb.css(r,e),o.trigger("scroll",{scrollbar:o._scrollbar,scrollBodyPosition:l,scrollThumbPosition:e})}},scrollBodyPosition:function(){return this._scrollBodyPosition}},{axis:"y",minThumbSize:20,mouseWheelStep:100,scrollPageWhenEnd:!1})});