/*!
 * JRaiser 2 Javascript Library
 * localStorage implemented by userData
 * http://jraiser.org/ | Released under MIT license
 */
!function(e){function t(e){e||(e=new Date,e.setFullYear(e.getFullYear()+1)),a.expires=e.toUTCString(),a.save(r)}if(!e.localStorage){var n=e.document,o=e.location,a=n.createElement("input");a.type="hidden",a.addBehavior("#default#userData"),n.body.insertBefore(a,n.body.firstChild);var r=o.hostname;a.load(r),e.localStorage={getItem:function(e){return a.getAttribute(e)},setItem:function(e,n){a.setAttribute(e,n),t()},removeItem:function(e){a.removeAttribute(e),t()},clear:function(){t(new Date(315532799e3)),a.load(r)}}}}(window);