/*!
 * JRaiser 2 Javascript Library
 * xtemplate engine - v4.5.0 (2016-01-18T15:52:58+0800)
 * http://jraiser.org/ | Released under MIT license
 */
/**
 * XTemplate模板引擎
 * @module xtpl/4.5.x/xtemplate
 * @category Utility
 * @ignore
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["xtemplate"] = factory();
	else
		root["xtemplate"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(2);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * simple facade for runtime and compiler
	 */

	'use strict';

	var XTemplateRuntime = __webpack_require__(3);
	var util = XTemplateRuntime.util;
	var Compiler = __webpack_require__(9);
	var compile = Compiler.compile;

	/**
	 * xtemplate engine
	 *
	 *      @example
	 *      modulex.use('xtemplate', function(XTemplate){
	 *          document.writeln(new XTemplate('{{title}}').render({title:2}));
	 *      });
	 *
	 * @class XTemplate
	 * @extends XTemplate.Runtime
	 */
	function XTemplate(tpl_, config_) {
	  var tpl = tpl_;
	  var config = config_;
	  var tplType = typeof tpl;
	  if (tplType !== 'string' && tplType !== 'function') {
	    config = tpl;
	    tpl = undefined;
	  }
	  config = this.config = util.merge(XTemplate.globalConfig, config);
	  if (tplType === 'string') {
	    try {
	      tpl = this.compile(tpl, config.name);
	    } catch (err) {
	      this.compileError = err;
	    }
	  }
	  XTemplateRuntime.call(this, tpl, config);
	}

	function Noop() {}

	Noop.prototype = XTemplateRuntime.prototype;
	XTemplate.prototype = new Noop();
	XTemplate.prototype.constructor = XTemplate;

	XTemplate.prototype.compile = function (content, name) {
	  return compile(content, name, this.config);
	};

	XTemplate.prototype.render = function (data, option, callback_) {
	  var callback = callback_;
	  if (typeof option === 'function') {
	    callback = option;
	  }
	  var compileError = this.compileError;
	  if (compileError) {
	    if (callback) {
	      callback(compileError);
	    } else {
	      throw compileError;
	    }
	  } else {
	    return XTemplateRuntime.prototype.render.apply(this, arguments);
	  }
	};

	module.exports = util.mix(XTemplate, {
	  config: XTemplateRuntime.config,

	  compile: compile,

	  Compiler: Compiler,

	  Scope: XTemplateRuntime.Scope,

	  Runtime: XTemplateRuntime,

	  /**
	   * add command to all template
	   * @method
	   * @static
	   * @param {String} commandName
	   * @param {Function} fn
	   */
	  addCommand: XTemplateRuntime.addCommand,

	  /**
	   * remove command from all template by name
	   * @method
	   * @static
	   * @param {String} commandName
	   */
	  removeCommand: XTemplateRuntime.removeCommand
	});

	/*
	 It consists three modules:

	 -   xtemplate - Both compiler and runtime functionality.
	 -   xtemplate/compiler - Compiler string template to module functions.
	 -   xtemplate/runtime -  Runtime for string template( with xtemplate/compiler loaded)
	 or template functions.

	 xtemplate/compiler depends on xtemplate/runtime,
	 because compiler needs to know about runtime to generate corresponding codes.
	 */

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * xtemplate runtime
	 */

	'use strict';

	var util = __webpack_require__(4);
	var nativeCommands = __webpack_require__(6);
	var commands = {};
	var Scope = __webpack_require__(7);
	var LinkedBuffer = __webpack_require__(8);

	// for performance: reduce hidden class
	function TplWrap(name, runtime, root, scope, buffer, originalName, fn, parent) {
	  this.name = name;
	  this.originalName = originalName || name;
	  this.runtime = runtime;
	  this.root = root;
	  // line counter
	  this.pos = { line: 1 };
	  this.scope = scope;
	  this.buffer = buffer;
	  this.fn = fn;
	  this.parent = parent;
	}

	function findCommand(runtimeCommands, instanceCommands, parts) {
	  var name = parts[0];
	  var cmd = runtimeCommands && runtimeCommands[name] || instanceCommands && instanceCommands[name] || commands[name];
	  if (parts.length === 1) {
	    return cmd;
	  }
	  if (cmd) {
	    var len = parts.length;
	    for (var i = 1; i < len; i++) {
	      cmd = cmd[parts[i]];
	      if (!cmd) {
	        return false;
	      }
	    }
	  }
	  return cmd;
	}

	function getSubNameFromParentName(parentName, subName) {
	  var parts = parentName.split('/');
	  var subParts = subName.split('/');
	  parts.pop();
	  for (var i = 0, l = subParts.length; i < l; i++) {
	    var subPart = subParts[i];
	    if (subPart === '.') {
	      continue;
	    } else if (subPart === '..') {
	      parts.pop();
	    } else {
	      parts.push(subPart);
	    }
	  }
	  return parts.join('/');
	}

	// depth: ../x.y() => 1
	function callFn(tpl, scope, option, buffer, parts, depth) {
	  var caller = undefined;
	  var fn = undefined;
	  var command1 = undefined;
	  if (!depth) {
	    command1 = findCommand(tpl.runtime.commands, tpl.root.config.commands, parts);
	  }
	  if (command1) {
	    return command1.call(tpl, scope, option, buffer);
	  } else if (command1 !== false) {
	    var callerParts = parts.slice(0, -1);
	    caller = scope.resolve(callerParts, depth);
	    if (caller === null || caller === undefined) {
	      buffer.error('Execute function `' + parts.join('.') + '` Error: ' + callerParts.join('.') + ' is undefined or null');
	      return buffer;
	    }
	    fn = caller[parts[parts.length - 1]];
	    if (fn) {
	      // apply(x, undefined) error in ie8
	      try {
	        return fn.apply(caller, option.params || []);
	      } catch (err) {
	        buffer.error('Execute function `' + parts.join('.') + '` Error: ' + err.message);
	        return buffer;
	      }
	    }
	  }
	  buffer.error('Command Not Found: ' + parts.join('.'));
	  return buffer;
	}

	var utils = {
	  callFn: callFn,

	  // {{y().z()}}
	  callDataFn: function callDataFn(params, parts) {
	    var caller = parts[0];
	    var fn = caller;
	    for (var i = 1; i < parts.length; i++) {
	      var _name = parts[i];
	      if (fn && fn[_name]) {
	        caller = fn;
	        fn = fn[_name];
	      } else {
	        return '';
	      }
	    }
	    return fn.apply(caller, params || []);
	  },

	  callCommand: function callCommand(tpl, scope, option, buffer, parts) {
	    return callFn(tpl, scope, option, buffer, parts);
	  }
	};

	/**
	 * template file name for chrome debug
	 *
	 * @cfg {Boolean} name
	 * @member XTemplate.Runtime
	 */

	/**
	 * XTemplate runtime. only accept tpl as function.
	 * @class XTemplate.Runtime
	 */
	function XTemplateRuntime(fn, config) {
	  this.fn = fn;
	  this.config = util.merge(XTemplateRuntime.globalConfig, config);
	  this.subNameResolveCache = {};
	  this.loadedSubTplNames = {};
	}

	util.mix(XTemplateRuntime, {
	  config: function config(key, v) {
	    var globalConfig = this.globalConfig = this.globalConfig || {};
	    if (key !== undefined) {
	      if (v !== undefined) {
	        globalConfig[key] = v;
	      } else {
	        util.mix(globalConfig, key);
	      }
	    } else {
	      return globalConfig;
	    }
	  },

	  nativeCommands: nativeCommands,

	  utils: utils,

	  util: util,

	  /**
	   * add command to all template
	   * @method
	   * @static
	   * @param {String} commandName
	   * @param {Function} fn
	   * @member XTemplate.Runtime
	   */
	  addCommand: function addCommand(commandName, fn) {
	    commands[commandName] = fn;
	  },

	  /**
	   * remove command from all template by name
	   * @method
	   * @static
	   * @param {String} commandName
	   * @member XTemplate.Runtime
	   */
	  removeCommand: function removeCommand(commandName) {
	    delete commands[commandName];
	  }
	});

	function resolve(root, subName_, parentName) {
	  var subName = subName_;
	  if (subName.charAt(0) !== '.') {
	    return subName;
	  }
	  var key = parentName + '_ks_' + subName;
	  var nameResolveCache = root.subNameResolveCache;
	  var cached = nameResolveCache[key];
	  if (cached) {
	    return cached;
	  }
	  subName = nameResolveCache[key] = getSubNameFromParentName(parentName, subName);
	  return subName;
	}

	function loadInternal(root, name, runtime, scope, buffer, originalName, escape, parentTpl) {
	  var tpl = new TplWrap(name, runtime, root, scope, buffer, originalName, undefined, parentTpl);
	  buffer.tpl = tpl;
	  root.config.loader.load(tpl, function (error, tplFn_) {
	    var tplFn = tplFn_;
	    if (typeof tplFn === 'function') {
	      tpl.fn = tplFn;
	      // reduce count of object field for performance
	      renderTpl(tpl);
	    } else if (error) {
	      buffer.error(error);
	    } else {
	      tplFn = tplFn || '';
	      if (escape) {
	        buffer.writeEscaped(tplFn);
	      } else {
	        buffer.data += tplFn;
	      }
	      buffer.end();
	    }
	  });
	}

	function includeInternal(root, scope, escape, buffer, tpl, originalName) {
	  var name = resolve(root, originalName, tpl.name);
	  var newBuffer = buffer.insert();
	  var next = newBuffer.next;
	  loadInternal(root, name, tpl.runtime, scope, newBuffer, originalName, escape, buffer.tpl);
	  return next;
	}

	function includeModuleInternal(root, scope, buffer, tpl, tplFn) {
	  var newBuffer = buffer.insert();
	  var next = newBuffer.next;
	  var newTpl = new TplWrap(tplFn.TPL_NAME, tpl.runtime, root, scope, newBuffer, undefined, tplFn, buffer.tpl);
	  newBuffer.tpl = newTpl;
	  renderTpl(newTpl);
	  return next;
	}

	function renderTpl(tpl) {
	  var buffer = tpl.fn();
	  // tpl.fn exception
	  if (buffer) {
	    var runtime = tpl.runtime;
	    var extendTpl = runtime.extendTpl;
	    var extendTplName = undefined;
	    if (extendTpl) {
	      extendTplName = extendTpl.params[0];
	      if (!extendTplName) {
	        return buffer.error('extend command required a non-empty parameter');
	      }
	    }
	    var extendTplFn = runtime.extendTplFn;
	    var extendTplBuffer = runtime.extendTplBuffer;
	    // if has extend statement, only parse
	    if (extendTplFn) {
	      runtime.extendTpl = null;
	      runtime.extendTplBuffer = null;
	      runtime.extendTplFn = null;
	      includeModuleInternal(tpl.root, tpl.scope, extendTplBuffer, tpl, extendTplFn).end();
	    } else if (extendTplName) {
	      runtime.extendTpl = null;
	      runtime.extendTplBuffer = null;
	      includeInternal(tpl.root, tpl.scope, 0, extendTplBuffer, tpl, extendTplName).end();
	    }
	    return buffer.end();
	  }
	}

	function getIncludeScope(scope, option, buffer) {
	  var params = option.params;
	  if (!params[0]) {
	    return buffer.error('include command required a non-empty parameter');
	  }
	  var newScope = scope;
	  var newScopeData = params[1];
	  var hash = option.hash;
	  if (hash) {
	    if (newScopeData) {
	      newScopeData = util.mix({}, newScopeData);
	    } else {
	      newScopeData = {};
	    }
	    util.mix(newScopeData, hash);
	  }
	  // sub template scope
	  if (newScopeData) {
	    newScope = new Scope(newScopeData, undefined, scope);
	  }
	  return newScope;
	}

	function checkIncludeOnce(root, option, tpl) {
	  var originalName = option.params[0];
	  var name = resolve(root, originalName, tpl.name);
	  var loadedSubTplNames = root.loadedSubTplNames;

	  if (loadedSubTplNames[name]) {
	    return false;
	  }
	  loadedSubTplNames[name] = true;
	  return true;
	}

	XTemplateRuntime.prototype = {
	  constructor: XTemplateRuntime,

	  Scope: Scope,

	  nativeCommands: nativeCommands,

	  utils: utils,

	  /**
	   * remove command by name
	   * @param commandName
	   */
	  removeCommand: function removeCommand(commandName) {
	    var config = this.config;
	    if (config.commands) {
	      delete config.commands[commandName];
	    }
	  },

	  /**
	   * add command definition to current template
	   * @param commandName
	   * @param {Function} fn command definition
	   */
	  addCommand: function addCommand(commandName, fn) {
	    var config = this.config;
	    config.commands = config.commands || {};
	    config.commands[commandName] = fn;
	  },

	  include: function include(scope, option, buffer, tpl) {
	    return includeInternal(this, getIncludeScope(scope, option, buffer), option.escape, buffer, tpl, option.params[0]);
	  },

	  includeModule: function includeModule(scope, option, buffer, tpl) {
	    return includeModuleInternal(this, getIncludeScope(scope, option, buffer), buffer, tpl, option.params[0]);
	  },

	  includeOnce: function includeOnce(scope, option, buffer, tpl) {
	    if (checkIncludeOnce(this, option, tpl)) {
	      return this.include(scope, option, buffer, tpl);
	    }
	    return buffer;
	  },

	  includeOnceModule: function includeOnceModule(scope, option, buffer, tpl) {
	    if (checkIncludeOnce(this, option, tpl)) {
	      return this.includeModule(scope, option, buffer, tpl);
	    }
	    return buffer;
	  },

	  /**
	   * get result by merge data with template
	   */
	  render: function render(data, option_, callback_) {
	    var _this = this;

	    var option = option_;
	    var callback = callback_;
	    var html = '';
	    var fn = this.fn;
	    var config = this.config;
	    if (typeof option === 'function') {
	      callback = option;
	      option = null;
	    }
	    option = option || {};
	    if (!callback) {
	      callback = function (error_, ret) {
	        var error = error_;
	        if (error) {
	          if (!(error instanceof Error)) {
	            error = new Error(error);
	          }
	          throw error;
	        }
	        html = ret;
	      };
	    }
	    var name = this.config.name;
	    if (!name && fn && fn.TPL_NAME) {
	      name = fn.TPL_NAME;
	    }
	    var scope = undefined;
	    if (data instanceof Scope) {
	      scope = data;
	    } else {
	      scope = new Scope(data);
	    }
	    var buffer = new XTemplateRuntime.LinkedBuffer(callback, config).head;
	    var tpl = new TplWrap(name, {
	      commands: option.commands
	    }, this, scope, buffer, name, fn);
	    buffer.tpl = tpl;
	    if (!fn) {
	      config.loader.load(tpl, function (err, fn2) {
	        if (fn2) {
	          tpl.fn = _this.fn = fn2;
	          renderTpl(tpl);
	        } else if (err) {
	          buffer.error(err);
	        }
	      });
	      return html;
	    }
	    renderTpl(tpl);
	    return html;
	  }
	};

	XTemplateRuntime.Scope = Scope;
	XTemplateRuntime.LinkedBuffer = LinkedBuffer;

	module.exports = XTemplateRuntime;

	/**
	 * @ignore
	 *
	 * 2012-09-12 yiminghe@gmail.com
	 *  - 参考 velocity, 扩充 ast
	 *  - Expression/ConditionalOrExpression
	 *  - EqualityExpression/RelationalExpression...
	 *
	 * 2012-09-11 yiminghe@gmail.com
	 *  - 初步完成，添加 tc
	 *
	 * 对比 template
	 *
	 *  优势
	 *      - 不会莫名其妙报错（with）
	 *      - 更多出错信息，直接给出行号
	 *      - 更容易扩展 command, sub-tpl
	 *      - 支持子模板
	 *      - 支持作用域链: ..\x ..\..\y
	 *      - 内置 escapeHtml 支持
	 *      - 支持预编译
	 *      - 支持简单表达式 +-/%* ()
	 *      - 支持简单比较 === !===
	 *      - 支持类似函数的嵌套命令
	 *   劣势
	 *      - 不支持完整 js 语法
	 */

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	// http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
	// http://wonko.com/post/html-escaping

	var escapeHtml = __webpack_require__(5);

	var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
	var win = typeof global !== 'undefined' ? global : window;

	var util = undefined;
	var toString = Object.prototype.toString;
	module.exports = util = {
	  isArray: Array.isArray || function (obj) {
	    return toString.call(obj) === '[object Array]';
	  },

	  keys: Object.keys || function (o) {
	    var result = [];
	    var p = undefined;

	    for (p in o) {
	      result.push(p);
	    }

	    return result;
	  },

	  each: function each(object, fn) {
	    var context = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	    if (object) {
	      var key = undefined;
	      var val = undefined;
	      var keys = undefined;
	      var i = 0;
	      var _length = object && object.length;
	      // do not use typeof obj == 'function': bug in phantomjs
	      var isObj = _length === undefined || Object.prototype.toString.call(object) === '[object Function]';

	      if (isObj) {
	        keys = util.keys(object);
	        for (; i < keys.length; i++) {
	          key = keys[i];
	          // can not use hasOwnProperty
	          if (fn.call(context, object[key], key, object) === false) {
	            break;
	          }
	        }
	      } else {
	        for (val = object[0]; i < _length; val = object[++i]) {
	          if (fn.call(context, val, i, object) === false) {
	            break;
	          }
	        }
	      }
	    }
	    return object;
	  },

	  mix: function mix(t, s) {
	    if (s) {
	      for (var p in s) {
	        t[p] = s[p];
	      }
	    }
	    return t;
	  },

	  globalEval: function globalEval(data) {
	    if (win.execScript) {
	      win.execScript(data);
	    } else {
	      (function (d) {
	        win.eval.call(win, d);
	      })(data);
	    }
	  },

	  substitute: function substitute(str, o, regexp) {
	    if (typeof str !== 'string' || !o) {
	      return str;
	    }

	    return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
	      if (match.charAt(0) === '\\') {
	        return match.slice(1);
	      }
	      return o[name] === undefined ? '' : o[name];
	    });
	  },

	  escapeHtml: escapeHtml,

	  merge: function merge() {
	    var i = 0;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    var len = args.length;
	    var ret = {};
	    for (; i < len; i++) {
	      var arg = args[i];
	      if (arg) {
	        util.mix(ret, arg);
	      }
	    }
	    return ret;
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/***/ function(module, exports) {

	/*!
	 * escape-html
	 * Copyright(c) 2012-2013 TJ Holowaychuk
	 * Copyright(c) 2015 Andreas Lubbe
	 * Copyright(c) 2015 Tiancheng "Timothy" Gu
	 * MIT Licensed
	 */

	'use strict';

	/**
	 * Module variables.
	 * @private
	 */

	var matchHtmlRegExp = /["'&<>]/;

	/**
	 * Module exports.
	 * @public
	 */

	module.exports = escapeHtml;

	/**
	 * Escape special characters in the given string of html.
	 *
	 * @param  {string} string The string to escape for inserting into HTML
	 * @return {string}
	 * @public
	 */

	function escapeHtml(string) {
	  var str = '' + string;
	  var match = matchHtmlRegExp.exec(str);

	  if (!match) {
	    return str;
	  }

	  var escape;
	  var html = '';
	  var index = 0;
	  var lastIndex = 0;

	  for (index = match.index; index < str.length; index++) {
	    switch (str.charCodeAt(index)) {
	      case 34: // "
	        escape = '&quot;';
	        break;
	      case 38: // &
	        escape = '&amp;';
	        break;
	      case 39: // '
	        escape = '&#39;';
	        break;
	      case 60: // <
	        escape = '&lt;';
	        break;
	      case 62: // >
	        escape = '&gt;';
	        break;
	      default:
	        continue;
	    }

	    if (lastIndex !== index) {
	      html += str.substring(lastIndex, index);
	    }

	    lastIndex = index + 1;
	    html += escape;
	  }

	  return lastIndex !== index
	    ? html + str.substring(lastIndex, index)
	    : html;
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * native commands for xtemplate.
	 */

	'use strict';

	var Scope = __webpack_require__(7);
	var util = __webpack_require__(4);
	var commands = {
	  // range(start, stop, [step])
	  range: function range(scope, option) {
	    var params = option.params;
	    var start = params[0];
	    var end = params[1];
	    var step = params[2];
	    if (!step) {
	      step = start > end ? -1 : 1;
	    } else if (start > end && step > 0 || start < end && step < 0) {
	      step = -step;
	    }
	    var ret = [];
	    for (var i = start; start < end ? i < end : i > end; i += step) {
	      ret.push(i);
	    }
	    return ret;
	  },

	  'void': function _void() {
	    return undefined;
	  },

	  foreach: function foreach(scope, option, buffer_) {
	    var buffer = buffer_;
	    var params = option.params;
	    var param0 = params[0];
	    var xindexName = params[2] || 'xindex';
	    var valueName = params[1];
	    var xcount = undefined;
	    var opScope = undefined;
	    var affix = undefined;
	    var xindex = undefined;
	    if (param0) {
	      xcount = param0.length;
	      for (xindex = 0; xindex < xcount; xindex++) {
	        opScope = new Scope(param0[xindex], {
	          xcount: xcount,
	          xindex: xindex
	        }, scope);
	        affix = opScope.affix;
	        if (xindexName !== 'xindex') {
	          affix[xindexName] = xindex;
	          affix.xindex = undefined;
	        }
	        if (valueName) {
	          affix[valueName] = param0[xindex];
	        }
	        buffer = option.fn(opScope, buffer);
	      }
	    }
	    return buffer;
	  },

	  forin: function forin(scope, option, buffer_) {
	    var buffer = buffer_;
	    var params = option.params;
	    var param0 = params[0];
	    var xindexName = params[2] || 'xindex';
	    var valueName = params[1];
	    var opScope = undefined;
	    var affix = undefined;
	    var name = undefined;
	    // if undefined, will emit warning by compiler
	    if (param0) {
	      for (name in param0) {
	        opScope = new Scope(param0[name], {
	          xindex: name
	        }, scope);
	        affix = opScope.affix;
	        if (xindexName !== 'xindex') {
	          affix[xindexName] = name;
	          affix.xindex = undefined;
	        }
	        if (valueName) {
	          affix[valueName] = param0[name];
	        }
	        buffer = option.fn(opScope, buffer);
	      }
	    }
	    return buffer;
	  },

	  each: function each(scope, option, buffer) {
	    var params = option.params;
	    var param0 = params[0];
	    if (param0) {
	      if (util.isArray(param0)) {
	        return commands.foreach(scope, option, buffer);
	      }
	      return commands.forin(scope, option, buffer);
	    }
	    return buffer;
	  },

	  'with': function _with(scope, option, buffer_) {
	    var buffer = buffer_;
	    var params = option.params;
	    var param0 = params[0];
	    if (param0) {
	      // skip object check for performance
	      var opScope = new Scope(param0, undefined, scope);
	      buffer = option.fn(opScope, buffer);
	    }
	    return buffer;
	  },

	  'if': function _if(scope, option, buffer_) {
	    var buffer = buffer_;
	    var params = option.params;
	    var param0 = params[0];
	    if (param0) {
	      var fn = option.fn;
	      if (fn) {
	        buffer = fn(scope, buffer);
	      }
	    } else {
	      var matchElseIf = false;
	      var elseIfs = option.elseIfs;
	      var inverse = option.inverse;
	      if (elseIfs) {
	        for (var i = 0, len = elseIfs.length; i < len; i++) {
	          var elseIf = elseIfs[i];
	          matchElseIf = elseIf.test(scope);
	          if (matchElseIf) {
	            buffer = elseIf.fn(scope, buffer);
	            break;
	          }
	        }
	      }
	      if (!matchElseIf && inverse) {
	        buffer = inverse(scope, buffer);
	      }
	    }
	    return buffer;
	  },

	  set: function set(scope_, option, buffer) {
	    var scope = scope_;
	    var hash = option.hash;
	    var len = hash.length;
	    for (var i = 0; i < len; i++) {
	      var h = hash[i];
	      var parts = h.key;
	      var depth = h.depth;
	      var value = h.value;
	      if (parts.length === 1) {
	        var root = scope.root;
	        while (depth && root !== scope) {
	          scope = scope.parent;
	          --depth;
	        }
	        scope.set(parts[0], value);
	      } else {
	        var last = scope.resolve(parts.slice(0, -1), depth);
	        if (last) {
	          last[parts[parts.length - 1]] = value;
	        }
	      }
	    }
	    return buffer;
	  },

	  include: 1,

	  includeOnce: 1,

	  parse: 1,

	  extend: 1,

	  block: function block(scope, option, buffer_) {
	    var buffer = buffer_;
	    var self = this;
	    var runtime = self.runtime;
	    var params = option.params;
	    var blockName = params[0];
	    var type = undefined;
	    if (params.length === 2) {
	      type = params[0];
	      blockName = params[1];
	    }
	    var blocks = runtime.blocks = runtime.blocks || {};
	    var head = blocks[blockName];
	    var cursor = undefined;
	    var current = {
	      fn: option.fn,
	      type: type
	    };
	    if (!head) {
	      blocks[blockName] = current;
	    } else if (head.type) {
	      if (head.type === 'append') {
	        current.next = head;
	        blocks[blockName] = current;
	      } else if (head.type === 'prepend') {
	        var prev = undefined;
	        cursor = head;
	        while (cursor && cursor.type === 'prepend') {
	          prev = cursor;
	          cursor = cursor.next;
	        }
	        current.next = cursor;
	        prev.next = current;
	      }
	    }

	    if (!runtime.extendTpl) {
	      cursor = blocks[blockName];
	      while (cursor) {
	        if (cursor.fn) {
	          buffer = cursor.fn.call(self, scope, buffer);
	        }
	        cursor = cursor.next;
	      }
	    }

	    return buffer;
	  },

	  macro: function macro(scope, option, buffer_) {
	    var buffer = buffer_;
	    var hash = option.hash;
	    var params = option.params;
	    var macroName = params[0];
	    var params1 = params.slice(1);
	    var self = this;
	    var runtime = self.runtime;
	    var macros = runtime.macros = runtime.macros || {};
	    var macro = macros[macroName];
	    // definition
	    if (option.fn) {
	      macros[macroName] = {
	        paramNames: params1,
	        hash: hash,
	        fn: option.fn
	      };
	    } else if (macro) {
	      var paramValues = macro.hash || {};
	      var paramNames = undefined;
	      if (paramNames = macro.paramNames) {
	        for (var i = 0, len = paramNames.length; i < len; i++) {
	          var p = paramNames[i];
	          paramValues[p] = params1[i];
	        }
	      }
	      if (hash) {
	        for (var h in hash) {
	          paramValues[h] = hash[h];
	        }
	      }
	      var newScope = new Scope(paramValues);
	      // https://github.com/xtemplate/xtemplate/issues/29
	      newScope.root = scope.root;
	      // no caller Scope
	      buffer = macro.fn.call(self, newScope, buffer);
	    } else {
	      var error = 'can not find macro: ' + macroName;
	      buffer.error(error);
	    }
	    return buffer;
	  }
	};

	commands['debugger'] = function () {
	  util.globalEval('debugger');
	};

	module.exports = commands;

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * scope resolution for xtemplate like function in javascript but keep original data unmodified
	 */

	'use strict';

	function Scope(data, affix, parent) {
	  if (data !== undefined) {
	    this.data = data;
	  } else {
	    this.data = {};
	  }
	  if (parent) {
	    this.parent = parent;
	    this.root = parent.root;
	  } else {
	    this.parent = undefined;
	    this.root = this;
	  }
	  this.affix = affix || {};
	  this.ready = false;
	}

	Scope.prototype = {
	  isScope: 1,

	  constructor: Scope,

	  setParent: function setParent(parentScope) {
	    this.parent = parentScope;
	    this.root = parentScope.root;
	  },

	  // keep original data unmodified
	  set: function set(name, value) {
	    this.affix[name] = value;
	  },

	  setData: function setData(data) {
	    this.data = data;
	  },

	  getData: function getData() {
	    return this.data;
	  },

	  mix: function mix(v) {
	    var affix = this.affix;
	    for (var _name in v) {
	      affix[_name] = v[_name];
	    }
	  },

	  get: function get(name) {
	    var data = this.data;
	    var v = undefined;
	    var affix = this.affix;

	    if (data !== null && data !== undefined) {
	      v = data[name];
	    }

	    if (v !== undefined) {
	      return v;
	    }

	    return affix[name];
	  },

	  resolveInternalOuter: function resolveInternalOuter(parts) {
	    var part0 = parts[0];
	    var v = undefined;
	    var self = this;
	    var scope = self;
	    if (part0 === 'this') {
	      v = self.data;
	    } else if (part0 === 'root') {
	      scope = scope.root;
	      v = scope.data;
	    } else if (part0) {
	      do {
	        v = scope.get(part0);
	      } while (v === undefined && (scope = scope.parent));
	    } else {
	      return [scope.data];
	    }
	    return [undefined, v];
	  },

	  resolveInternal: function resolveInternal(parts) {
	    var ret = this.resolveInternalOuter(parts);
	    if (ret.length === 1) {
	      return ret[0];
	    }
	    var i = undefined;
	    var len = parts.length;
	    var v = ret[1];
	    if (v === undefined) {
	      return undefined;
	    }
	    for (i = 1; i < len; i++) {
	      if (v === null || v === undefined) {
	        return v;
	      }
	      v = v[parts[i]];
	    }
	    return v;
	  },

	  resolveLooseInternal: function resolveLooseInternal(parts) {
	    var ret = this.resolveInternalOuter(parts);
	    if (ret.length === 1) {
	      return ret[0];
	    }
	    var i = undefined;
	    var len = parts.length;
	    var v = ret[1];
	    for (i = 1; v !== null && v !== undefined && i < len; i++) {
	      v = v[parts[i]];
	    }
	    return v;
	  },

	  resolveUp: function resolveUp(parts) {
	    return this.parent && this.parent.resolveInternal(parts);
	  },

	  resolveLooseUp: function resolveLooseUp(parts) {
	    return this.parent && this.parent.resolveLooseInternal(parts);
	  },

	  resolveOuter: function resolveOuter(parts, d) {
	    var self = this;
	    var scope = self;
	    var depth = d;
	    var v = undefined;
	    if (!depth && parts.length === 1) {
	      v = self.get(parts[0]);
	      if (v !== undefined) {
	        return [v];
	      }
	      depth = 1;
	    }
	    if (depth) {
	      while (scope && depth--) {
	        scope = scope.parent;
	      }
	    }
	    if (!scope) {
	      return [undefined];
	    }
	    return [undefined, scope];
	  },

	  resolveLoose: function resolveLoose(parts, depth) {
	    var ret = this.resolveOuter(parts, depth);
	    if (ret.length === 1) {
	      return ret[0];
	    }
	    return ret[1].resolveLooseInternal(parts);
	  },

	  resolve: function resolve(parts, depth) {
	    var ret = this.resolveOuter(parts, depth);
	    if (ret.length === 1) {
	      return ret[0];
	    }
	    return ret[1].resolveInternal(parts);
	  }
	};

	module.exports = Scope;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * LinkedBuffer of generate content from xtemplate
	 */

	'use strict';

	var util = __webpack_require__(4);

	function Buffer(list, next, tpl) {
	  this.list = list;
	  this.init();
	  this.next = next;
	  this.ready = false;
	  // tpl belongs
	  this.tpl = tpl;
	}

	Buffer.prototype = {
	  constructor: Buffer,

	  isBuffer: 1,

	  init: function init() {
	    this.data = '';
	  },

	  append: function append(data) {
	    this.data += data;
	    return this;
	  },

	  write: function write(data) {
	    // ignore null or undefined
	    if (data !== null && data !== undefined) {
	      if (data.isBuffer) {
	        return data;
	      }
	      this.data += data;
	    }
	    return this;
	  },

	  writeEscaped: function writeEscaped(data) {
	    // ignore null or undefined
	    if (data !== null && data !== undefined) {
	      if (data.isBuffer) {
	        return data;
	      }
	      this.data += util.escapeHtml(data);
	    }
	    return this;
	  },

	  insert: function insert() {
	    var self = this;
	    var list = self.list;
	    var tpl = self.tpl;
	    var nextFragment = new Buffer(list, self.next, tpl);
	    var asyncFragment = new Buffer(list, nextFragment, tpl);
	    self.next = asyncFragment;
	    self.ready = true;
	    return asyncFragment;
	  },

	  async: function async(fn) {
	    var asyncFragment = this.insert();
	    var nextFragment = asyncFragment.next;
	    fn(asyncFragment);
	    return nextFragment;
	  },

	  error: function error(e_) {
	    var callback = this.list.callback;
	    var e = e_;
	    if (callback) {
	      var tpl = this.tpl;
	      if (tpl) {
	        if (!(e instanceof Error)) {
	          e = new Error(e);
	        }
	        var _name = tpl.name;
	        var line = tpl.pos.line;
	        var errorStr = 'XTemplate error in file: ' + _name + ' at line ' + line + ': ';
	        try {
	          // phantomjs
	          e.stack = errorStr + e.stack;
	          e.message = errorStr + e.message;
	        } catch (e2) {
	          // empty
	        }
	        e.xtpl = { pos: { line: line }, name: _name };
	      }
	      this.list.callback = null;
	      callback(e, undefined);
	    }
	  },

	  end: function end() {
	    var self = this;
	    if (self.list.callback) {
	      self.ready = true;
	      self.list.flush();
	    }
	    return self;
	  }
	};

	function LinkedBuffer(callback, config) {
	  var self = this;
	  self.config = config;
	  self.head = new Buffer(self, undefined);
	  self.callback = callback;
	  this.init();
	}

	LinkedBuffer.prototype = {
	  constructor: LinkedBuffer,

	  init: function init() {
	    this.data = '';
	  },

	  append: function append(data) {
	    this.data += data;
	  },

	  end: function end() {
	    this.callback(null, this.data);
	    this.callback = null;
	  },

	  flush: function flush() {
	    var self = this;
	    var fragment = self.head;
	    while (fragment) {
	      if (fragment.ready) {
	        this.data += fragment.data;
	      } else {
	        self.head = fragment;
	        return;
	      }
	      fragment = fragment.next;
	    }
	    self.end();
	  }
	};

	LinkedBuffer.Buffer = Buffer;

	module.exports = LinkedBuffer;

	/**
	 * 2014-06-19 yiminghe@gmail.com
	 * string concat is faster than array join: 85ms<-> 131ms
	 */

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * translate ast to js function code
	 */

	'use strict';

	var util = __webpack_require__(3).util;
	var compilerTools = __webpack_require__(10);
	var pushToArray = compilerTools.pushToArray;
	var wrapByDoubleQuote = compilerTools.wrapByDoubleQuote;
	// codeTemplates --------------------------- start
	var TMP_DECLARATION = ['var t;'];
	for (var i = 0; i < 10; i++) {
	  TMP_DECLARATION.push('var t' + i + ';');
	}
	var TOP_DECLARATION = TMP_DECLARATION.concat(['var tpl = this;\n  var root = tpl.root;\n  var buffer = tpl.buffer;\n  var scope = tpl.scope;\n  var runtime = tpl.runtime;\n  var name = tpl.name;\n  var pos = tpl.pos;\n  var data = scope.data;\n  var affix = scope.affix;\n  var nativeCommands = root.nativeCommands;\n  var utils = root.utils;']).join('\n');
	var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(tpl, scope, {option}, buffer);';
	var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(tpl, scope, {option}, buffer, {idParts});';
	var CALL_FUNCTION = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts});';
	var CALL_DATA_FUNCTION = '{lhs} = callDataFnUtil([{params}], {idParts});';
	var CALL_FUNCTION_DEPTH = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts}, {depth});';
	var ASSIGN_STATEMENT = 'var {lhs} = {value};';
	var SCOPE_RESOLVE_DEPTH = 'var {lhs} = scope.resolve({idParts},{depth});';
	var SCOPE_RESOLVE_LOOSE_DEPTH = 'var {lhs} = scope.resolveLoose({idParts},{depth});';
	var FUNC = 'function {functionName}({params}){\n  {body}\n}';
	var SOURCE_URL = '\n  //# sourceURL = {name}.js\n';
	var DECLARE_NATIVE_COMMANDS = 'var {name}Command = nativeCommands["{name}"];';
	var DECLARE_UTILS = 'var {name}Util = utils["{name}"];';
	var BUFFER_WRITE = 'buffer = buffer.write({value});';
	var BUFFER_APPEND = 'buffer.data += {value};';
	var BUFFER_WRITE_ESCAPED = 'buffer = buffer.writeEscaped({value});';
	var RETURN_BUFFER = 'return buffer;';
	// codeTemplates ---------------------------- end

	var XTemplateRuntime = __webpack_require__(3);
	var parser = __webpack_require__(11);
	parser.yy = __webpack_require__(12);
	var nativeCode = [];
	var substitute = util.substitute;
	var each = util.each;
	var nativeCommands = XTemplateRuntime.nativeCommands;
	var nativeUtils = XTemplateRuntime.utils;

	each(nativeUtils, function (v, name) {
	  nativeCode.push(substitute(DECLARE_UTILS, {
	    name: name
	  }));
	});

	each(nativeCommands, function (v, name) {
	  nativeCode.push(substitute(DECLARE_NATIVE_COMMANDS, {
	    name: name
	  }));
	});

	nativeCode = nativeCode.join('\n');

	var lastLine = 1;

	function markLine(pos, source) {
	  if (lastLine === pos.line) {
	    return;
	  }
	  lastLine = pos.line;
	  source.push('pos.line = ' + pos.line + ';');
	}

	function resetGlobal() {
	  lastLine = 1;
	}

	function getFunctionDeclare(functionName) {
	  return ['function ' + functionName + '(scope, buffer, undefined) {\n    var data = scope.data;\n    var affix = scope.affix;'];
	}

	function guid(self, str) {
	  return str + self.uuid++;
	}

	function opExpression(e) {
	  var source = [];
	  var type = e.opType;
	  var exp1 = undefined;
	  var exp2 = undefined;
	  var code1Source = undefined;
	  var code2Source = undefined;
	  var code1 = this[e.op1.type](e.op1);
	  var code2 = this[e.op2.type](e.op2);
	  var exp = guid(this, 'exp');
	  exp1 = code1.exp;
	  exp2 = code2.exp;
	  code1Source = code1.source;
	  code2Source = code2.source;
	  pushToArray(source, code1Source);
	  source.push('var ' + exp + ' = ' + exp1 + ';');
	  if (type === '&&' || type === '||') {
	    source.push('if(' + (type === '&&' ? '' : '!') + '(' + exp + ')){');
	    pushToArray(source, code2Source);
	    source.push(exp + ' = ' + exp2 + ';');
	    source.push('}');
	  } else {
	    pushToArray(source, code2Source);
	    source.push(exp + ' = (' + exp1 + ') ' + type + ' (' + exp2 + ');');
	  }
	  return {
	    exp: exp,
	    source: source
	  };
	}

	function genFunction(self, statements) {
	  var functionName = guid(self, 'func');
	  var source = getFunctionDeclare(functionName);
	  var statement = undefined;
	  for (var i = 0, len = statements.length; i < len; i++) {
	    statement = statements[i];
	    pushToArray(source, self[statement.type](statement).source);
	  }
	  source.push(RETURN_BUFFER);
	  source.push('}');
	  // avoid deep closure for performance
	  pushToArray(self.functionDeclares, source);
	  return functionName;
	}

	function genConditionFunction(self, condition) {
	  var functionName = guid(self, 'func');
	  var source = getFunctionDeclare(functionName);
	  var gen = self[condition.type](condition);
	  pushToArray(source, gen.source);
	  source.push('return ' + gen.exp + ';');
	  source.push('}');
	  pushToArray(self.functionDeclares, source);
	  return functionName;
	}

	function genTopFunction(self, statements) {
	  var catchError = self.config.catchError;
	  var source = [
	  // 'function run(tpl) {',
	  TOP_DECLARATION, nativeCode,
	  // decrease speed by 10%
	  // for performance
	  catchError ? 'try {' : ''];
	  var statement = undefined;
	  var i = undefined;
	  var len = undefined;
	  for (i = 0, len = statements.length; i < len; i++) {
	    statement = statements[i];
	    pushToArray(source, self[statement.type](statement, {
	      top: 1
	    }).source);
	  }
	  source.splice.apply(source, [2, 0].concat(self.functionDeclares).concat(''));
	  source.push(RETURN_BUFFER);
	  // source.push('}');
	  // source.push('function tryRun(tpl) {');
	  // source.push('try {');
	  // source.push('ret = run(this);');
	  if (catchError) {
	    source.push('} catch(e) {');
	    source.push('if(!e.xtpl){');
	    source.push('buffer.error(e);');
	    source.push('}else{ throw e; }');
	    source.push('}');
	  }
	  //    source.push('}');
	  //    source.push('return tryRun(this);');
	  return {
	    params: ['undefined'],
	    source: source.join('\n')
	  };
	}

	function genOptionFromFunction(self, func, escape, fn, elseIfs, inverse) {
	  var source = [];
	  var params = func.params;
	  var hash = func.hash;
	  var funcParams = [];
	  var isSetFunction = func.id.string === 'set';
	  if (params) {
	    each(params, function (param) {
	      var nextIdNameCode = self[param.type](param);
	      pushToArray(source, nextIdNameCode.source);
	      funcParams.push(nextIdNameCode.exp);
	    });
	  }
	  var funcHash = [];
	  if (hash) {
	    each(hash.value, function (h) {
	      var v = h[1];
	      var key = h[0];
	      var vCode = self[v.type](v);
	      pushToArray(source, vCode.source);
	      if (isSetFunction) {
	        // support  {{set(x.y.z=1)}}
	        // https://github.com/xtemplate/xtemplate/issues/54
	        var resolvedParts = compilerTools.convertIdPartsToRawAccessor(self, source, key.parts).resolvedParts;
	        funcHash.push({ key: resolvedParts, depth: key.depth, value: vCode.exp });
	      } else {
	        if (key.parts.length !== 1 || typeof key.parts[0] !== 'string') {
	          throw new Error('invalid hash parameter');
	        }
	        funcHash.push([wrapByDoubleQuote(key.string), vCode.exp]);
	      }
	    });
	  }
	  var exp = '';
	  // literal init array, do not use arr.push for performance
	  if (funcParams.length || funcHash.length || escape || fn || inverse || elseIfs) {
	    if (escape) {
	      exp += ',escape:1';
	    }
	    if (funcParams.length) {
	      exp += ',params:[' + funcParams.join(',') + ']';
	    }
	    if (funcHash.length) {
	      (function () {
	        var hashStr = [];
	        if (isSetFunction) {
	          util.each(funcHash, function (h) {
	            hashStr.push('{key:[' + h.key.join(',') + '],value:' + h.value + ', depth:' + h.depth + '}');
	          });
	          exp += ',hash: [' + hashStr.join(',') + ']';
	        } else {
	          util.each(funcHash, function (h) {
	            hashStr.push(h[0] + ':' + h[1]);
	          });
	          exp += ',hash: {' + hashStr.join(',') + '}';
	        }
	      })();
	    }
	    if (fn) {
	      exp += ',fn: ' + fn;
	    }
	    if (inverse) {
	      exp += ',inverse: ' + inverse;
	    }
	    if (elseIfs) {
	      exp += ',elseIfs: ' + elseIfs;
	    }
	    exp = '{' + exp.slice(1) + '}';
	  }
	  return {
	    exp: exp || '{}',
	    funcParams: funcParams,
	    source: source
	  };
	}

	function generateFunction(self, func, block, escape_) {
	  var escape = escape_;
	  var source = [];
	  markLine(func.pos, source);
	  var functionConfigCode = undefined;
	  var idName = undefined;
	  var id = func.id;
	  var idString = id.string;
	  if (idString in nativeCommands) {
	    escape = 0;
	  }
	  var idParts = id.parts;
	  var i = undefined;
	  if (idString === 'elseif') {
	    return {
	      exp: '',
	      source: []
	    };
	  }
	  if (block) {
	    var programNode = block.program;
	    var inverse = programNode.inverse;
	    var fnName = undefined;
	    var elseIfsName = undefined;
	    var inverseName = undefined;
	    var elseIfs = [];
	    var elseIf = undefined;
	    var functionValue = undefined;
	    var statement = undefined;
	    var statements = programNode.statements;
	    var thenStatements = [];
	    for (i = 0; i < statements.length; i++) {
	      statement = statements[i];
	      if (statement.type === 'expressionStatement' && (functionValue = statement.value) && (functionValue = functionValue.parts) && functionValue.length === 1 && (functionValue = functionValue[0]) && functionValue.type === 'function' && functionValue.id.string === 'elseif') {
	        if (elseIf) {
	          elseIfs.push(elseIf);
	        }
	        elseIf = {
	          condition: functionValue.params[0],
	          statements: []
	        };
	      } else if (elseIf) {
	        elseIf.statements.push(statement);
	      } else {
	        thenStatements.push(statement);
	      }
	    }
	    if (elseIf) {
	      elseIfs.push(elseIf);
	    }
	    // find elseIfs
	    fnName = genFunction(self, thenStatements);
	    if (inverse) {
	      inverseName = genFunction(self, inverse);
	    }
	    if (elseIfs.length) {
	      var elseIfsVariable = [];
	      for (i = 0; i < elseIfs.length; i++) {
	        var elseIfStatement = elseIfs[i];
	        var conditionName = genConditionFunction(self, elseIfStatement.condition);
	        elseIfsVariable.push('{test: ' + conditionName + ',fn : ' + genFunction(self, elseIfStatement.statements) + '}');
	      }
	      elseIfsName = '[' + elseIfsVariable.join(',') + ']';
	    }
	    functionConfigCode = genOptionFromFunction(self, func, escape, fnName, elseIfsName, inverseName);
	    pushToArray(source, functionConfigCode.source);
	  }

	  var isModule = self.config.isModule;

	  if (idString === 'include' || idString === 'parse' || idString === 'extend') {
	    if (!func.params || func.params.length > 2) {
	      throw new Error('include/parse/extend can only has at most two parameter!');
	    }
	  }

	  if (isModule) {
	    if (idString === 'include' || idString === 'parse') {
	      func.params[0] = { type: 'raw', value: 're' + 'quire("' + func.params[0].value + '")' };
	    }
	  }

	  if (!functionConfigCode) {
	    functionConfigCode = genOptionFromFunction(self, func, escape, null, null, null);
	    pushToArray(source, functionConfigCode.source);
	  }

	  if (!block) {
	    idName = guid(self, 'callRet');
	    source.push('var ' + idName);
	  }

	  if (idString in nativeCommands) {
	    if (idString === 'extend') {
	      source.push('runtime.extendTpl = ' + functionConfigCode.exp);
	      source.push('buffer = buffer.async(function(newBuffer){runtime.extendTplBuffer = newBuffer;});');
	      if (isModule) {
	        source.push('runtime.extendTplFn = re' + 'quire(' + functionConfigCode.exp + '.params[0])');
	      }
	    } else if (idString === 'include') {
	      source.push('buffer = root.' + (isModule ? 'includeModule' : 'include') + '(scope,' + functionConfigCode.exp + ',buffer,tpl);');
	    } else if (idString === 'includeOnce') {
	      source.push('buffer = root.' + (isModule ? 'includeOnceModule' : 'includeOnce') + '(scope,' + functionConfigCode.exp + ',buffer,tpl);');
	    } else if (idString === 'parse') {
	      source.push('buffer = root.' + (isModule ? 'includeModule' : 'include') + '(new scope.constructor(),' + functionConfigCode.exp + ',buffer,tpl);');
	    } else {
	      source.push(substitute(CALL_NATIVE_COMMAND, {
	        lhs: block ? 'buffer' : idName,
	        name: idString,
	        option: functionConfigCode.exp
	      }));
	    }
	  } else if (block) {
	    source.push(substitute(CALL_CUSTOM_COMMAND, {
	      option: functionConfigCode.exp,
	      idParts: compilerTools.convertIdPartsToRawAccessor(self, source, idParts).arr
	    }));
	  } else {
	    var resolveParts = compilerTools.convertIdPartsToRawAccessor(self, source, idParts);
	    // {{x.y().q.z()}}
	    // do not need scope resolution, call data function directly
	    if (resolveParts.funcRet) {
	      source.push(substitute(CALL_DATA_FUNCTION, {
	        lhs: idName,
	        params: functionConfigCode.funcParams.join(','),
	        idParts: resolveParts.arr,
	        depth: id.depth
	      }));
	    } else {
	      source.push(substitute(id.depth ? CALL_FUNCTION_DEPTH : CALL_FUNCTION, {
	        lhs: idName,
	        option: functionConfigCode.exp,
	        idParts: resolveParts.arr,
	        depth: id.depth
	      }));
	    }
	  }

	  return {
	    exp: idName,
	    source: source
	  };
	}

	function AstToJSProcessor(config) {
	  this.functionDeclares = [];
	  this.config = config;
	  this.uuid = 0;
	}

	AstToJSProcessor.prototype = {
	  constructor: AstToJSProcessor,

	  raw: function raw(_raw) {
	    return {
	      exp: _raw.value
	    };
	  },

	  arrayExpression: function arrayExpression(e) {
	    var list = e.list;
	    var len = list.length;
	    var r = undefined;
	    var source = [];
	    var exp = [];
	    for (var i = 0; i < len; i++) {
	      r = this[list[i].type](list[i]);
	      pushToArray(source, r.source);
	      exp.push(r.exp);
	    }
	    return {
	      exp: '[ ' + exp.join(',') + ' ]',
	      source: source
	    };
	  },

	  objectExpression: function objectExpression(e) {
	    var obj = e.obj;
	    var len = obj.length;
	    var r = undefined;
	    var source = [];
	    var exp = [];
	    for (var i = 0; i < len; i++) {
	      var item = obj[i];
	      r = this[item[1].type](item[1]);
	      pushToArray(source, r.source);
	      exp.push(wrapByDoubleQuote(item[0]) + ': ' + r.exp);
	    }
	    return {
	      exp: '{ ' + exp.join(',') + ' }',
	      source: source
	    };
	  },

	  conditionalOrExpression: opExpression,

	  conditionalAndExpression: opExpression,

	  relationalExpression: opExpression,

	  equalityExpression: opExpression,

	  additiveExpression: opExpression,

	  multiplicativeExpression: opExpression,

	  unaryExpression: function unaryExpression(e) {
	    var code = this[e.value.type](e.value);
	    return {
	      exp: e.unaryType + '(' + code.exp + ')',
	      source: code.source
	    };
	  },

	  string: function string(e) {
	    // same as contentNode.value
	    return {
	      exp: compilerTools.wrapBySingleQuote(compilerTools.escapeString(e.value, 1)),
	      source: []
	    };
	  },

	  number: function number(e) {
	    return {
	      exp: e.value,
	      source: []
	    };
	  },

	  id: function id(idNode) {
	    var source = [];
	    var self = this;
	    var loose = !self.config.strict;
	    markLine(idNode.pos, source);
	    if (compilerTools.isGlobalId(idNode)) {
	      return {
	        exp: idNode.string,
	        source: source
	      };
	    }
	    var depth = idNode.depth;
	    var idParts = idNode.parts;
	    var idName = guid(self, 'id');
	    if (depth) {
	      source.push(substitute(loose ? SCOPE_RESOLVE_LOOSE_DEPTH : SCOPE_RESOLVE_DEPTH, {
	        lhs: idName,
	        idParts: compilerTools.convertIdPartsToRawAccessor(self, source, idParts).arr,
	        depth: depth
	      }));
	      return {
	        exp: idName,
	        source: source
	      };
	    }
	    var part0 = idParts[0];
	    var remain = undefined;
	    var remainParts = undefined;
	    if (part0 === 'this') {
	      remainParts = idParts.slice(1);
	      source.push(substitute(ASSIGN_STATEMENT, {
	        lhs: idName,
	        value: remainParts.length ? compilerTools.chainedVariableRead(self, source, remainParts, undefined, undefined, loose) : 'data'
	      }));
	      return {
	        exp: idName,
	        source: source
	      };
	    } else if (part0 === 'root') {
	      remainParts = idParts.slice(1);
	      remain = remainParts.join('.');
	      if (remain) {
	        remain = '.' + remain;
	      }
	      source.push(substitute(ASSIGN_STATEMENT, {
	        lhs: idName,
	        value: remain ? compilerTools.chainedVariableRead(self, source, remainParts, true, undefined, loose) : 'scope.root.data',
	        idParts: remain
	      }));
	      return {
	        exp: idName,
	        source: source
	      };
	    }
	    // {{x.y().z}}
	    if (idParts[0].type === 'function') {
	      var resolvedParts = compilerTools.convertIdPartsToRawAccessor(self, source, idParts).resolvedParts;
	      for (var i = 1; i < resolvedParts.length; i++) {
	        resolvedParts[i] = '[' + resolvedParts[i] + ']';
	      }
	      var value = undefined;
	      if (loose) {
	        value = compilerTools.genStackJudge(resolvedParts.slice(1), resolvedParts[0]);
	      } else {
	        value = resolvedParts[0];
	        for (var ri = 1; ri < resolvedParts.length; ri++) {
	          value += resolvedParts[ri];
	        }
	      }
	      source.push(substitute(ASSIGN_STATEMENT, {
	        lhs: idName,
	        value: value
	      }));
	    } else {
	      source.push(substitute(ASSIGN_STATEMENT, {
	        lhs: idName,
	        value: compilerTools.chainedVariableRead(self, source, idParts, false, true, loose)
	      }));
	    }
	    return {
	      exp: idName,
	      source: source
	    };
	  },

	  'function': function _function(func, escape) {
	    return generateFunction(this, func, false, escape);
	  },

	  blockStatement: function blockStatement(block) {
	    return generateFunction(this, block.func, block);
	  },

	  expressionStatement: function expressionStatement(_expressionStatement) {
	    var source = [];
	    var escape = _expressionStatement.escape;
	    var code = undefined;
	    var expression = _expressionStatement.value;
	    var type = expression.type;
	    var expressionOrVariable = undefined;
	    code = this[type](expression, escape);
	    pushToArray(source, code.source);
	    expressionOrVariable = code.exp;
	    source.push(substitute(escape ? BUFFER_WRITE_ESCAPED : BUFFER_WRITE, {
	      value: expressionOrVariable
	    }));
	    return {
	      exp: '',
	      source: source
	    };
	  },

	  contentStatement: function contentStatement(_contentStatement) {
	    return {
	      exp: '',
	      source: [substitute(BUFFER_APPEND, {
	        value: compilerTools.wrapBySingleQuote(compilerTools.escapeString(_contentStatement.value, 0))
	      })]
	    };
	  }
	};

	var anonymousCount = 0;

	/**
	 * compiler for xtemplate
	 * @class XTemplate.Compiler
	 * @singleton
	 */
	var compiler = {
	  /**
	   * get ast of template
	   * @param {String} [name] xtemplate name
	   * @param {String} tplContent
	   * @return {Object}
	   */
	  parse: function parse(tplContent, name) {
	    if (tplContent) {
	      var ret = undefined;
	      try {
	        ret = parser.parse(tplContent, name);
	      } catch (err) {
	        var e = undefined;
	        if (err instanceof Error) {
	          e = err;
	        } else {
	          e = new Error(err);
	        }
	        var errorStr = 'XTemplate error ';
	        try {
	          e.stack = errorStr + e.stack;
	          e.message = errorStr + e.message;
	        } catch (e2) {
	          // empty
	        }
	        throw e;
	      }
	      return ret;
	    }
	    return {
	      statements: []
	    };
	  },

	  compileToStr: function compileToStr(param) {
	    var func = compiler.compileToJson(param);
	    return substitute(FUNC, {
	      functionName: param.functionName || '',
	      params: func.params.join(','),
	      body: func.source
	    });
	  },
	  /**
	   * get template function json format
	   * @param {String} [param.name] xtemplate name
	   * @param {String} param.content
	   * @param {Boolean} [param.isModule] whether generated function is used in module
	   * @param {Boolean} [param.catchError] whether to try catch generated function to provide good error message
	   * @param {Boolean} [param.strict] whether to generate strict function
	   * @return {Object}
	   */
	  compileToJson: function compileToJson(param) {
	    resetGlobal();
	    var name = param.name = param.name || 'xtemplate' + ++anonymousCount;
	    var content = param.content;
	    var root = compiler.parse(content, name);
	    return genTopFunction(new AstToJSProcessor(param), root.statements);
	  },
	  /**
	   * get template function
	   * @param {String} tplContent
	   * @param {String} name template file name
	   * @param {Object} config
	   * @return {Function}
	   */
	  compile: function compile(tplContent, name, config) {
	    var code = compiler.compileToJson(util.merge(config, {
	      content: tplContent,
	      name: name
	    }));
	    var source = code.source;
	    source += substitute(SOURCE_URL, {
	      name: name
	    });
	    var args = code.params.concat(source);
	    // eval is not ok for eval("(function(){})") ie
	    return Function.apply(null, args);
	  }
	};

	module.exports = compiler;

	/*
	 todo:
	 need oop, new Source().this()
	 */

/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * compiler tools
	 */

	'use strict';

	var doubleReg = /\\*"/g;
	var singleReg = /\\*'/g;
	var arrayPush = [].push;
	var globals = {};
	globals.undefined = globals['null'] = globals['true'] = globals['false'] = 1;

	function genStackJudge(parts, data, count, lastVariable_) {
	  if (count === undefined) count = 0;

	  if (!parts.length) {
	    return data;
	  }
	  var lastVariable = lastVariable_ || data;
	  var part0 = parts[0];
	  var variable = 't' + count;
	  return ['(' + data + ' != null ? ', genStackJudge(parts.slice(1), '(' + variable + '=' + lastVariable + part0 + ')', count + 1, variable), ' : ', lastVariable, ')'].join('');
	}

	function accessVariable(loose, parts, topVariable, fullVariable) {
	  return loose ? genStackJudge(parts.slice(1), topVariable) : fullVariable;
	}

	var tools = module.exports = {
	  genStackJudge: genStackJudge,

	  isGlobalId: function isGlobalId(node) {
	    if (globals[node.string]) {
	      return 1;
	    }
	    return 0;
	  },

	  chainedVariableRead: function chainedVariableRead(self, source, idParts, root, resolveUp, loose) {
	    var strs = tools.convertIdPartsToRawAccessor(self, source, idParts);
	    var parts = strs.parts;
	    var part0 = parts[0];
	    var scope = '';
	    if (root) {
	      scope = 'scope.root.';
	    }
	    var affix = scope + 'affix';
	    var data = scope + 'data';
	    var ret = ['(', '(t=(' + affix + part0 + ')) !== undefined ? ', idParts.length > 1 ? accessVariable(loose, parts, 't', affix + strs.str) : 't', ' : '];
	    if (resolveUp) {
	      ret = ret.concat(['(', '(t = ' + data + part0 + ') !== undefined ? ', idParts.length > 1 ? accessVariable(loose, parts, 't', data + strs.str) : 't', '  : ', loose ? 'scope.resolveLooseUp(' + strs.arr + ')' : 'scope.resolveUp(' + strs.arr + ')', ')']);
	    } else {
	      ret.push(accessVariable(loose, parts, data + part0, data + strs.str));
	    }
	    ret.push(')');
	    return ret.join('');
	  },

	  convertIdPartsToRawAccessor: function convertIdPartsToRawAccessor(self, source, idParts) {
	    var i = undefined;
	    var l = undefined;
	    var idPart = undefined;
	    var idPartType = undefined;
	    var nextIdNameCode = undefined;
	    var parts = [];
	    var ret = [];
	    var funcRet = '';
	    for (i = 0, l = idParts.length; i < l; i++) {
	      idPart = idParts[i];
	      idPartType = idPart.type;
	      if (idPartType) {
	        nextIdNameCode = self[idPartType](idPart);
	        tools.pushToArray(source, nextIdNameCode.source);
	        if (idPartType === 'function') {
	          funcRet = 1;
	        }
	        ret.push('[' + nextIdNameCode.exp + ']');
	        parts.push(nextIdNameCode.exp);
	      } else {
	        // literal a.x
	        ret.push('.' + idPart);
	        parts.push(tools.wrapByDoubleQuote(idPart));
	      }
	    }
	    // y().z() =>
	    // var a = y();
	    // a['z']
	    return { str: ret.join(''), arr: '[' + parts.join(',') + ']', parts: ret, funcRet: funcRet, resolvedParts: parts };
	  },

	  wrapByDoubleQuote: function wrapByDoubleQuote(str) {
	    return '"' + str + '"';
	  },

	  wrapBySingleQuote: function wrapBySingleQuote(str) {
	    return '\'' + str + '\'';
	  },

	  joinArrayOfString: function joinArrayOfString(arr) {
	    return tools.wrapByDoubleQuote(arr.join('","'));
	  },

	  escapeSingleQuoteInCodeString: function escapeSingleQuoteInCodeString(str, isDouble) {
	    return str.replace(isDouble ? doubleReg : singleReg, function (m_) {
	      var m = m_;
	      // \ 's number ，用户显式转过 "\'" , "\\\'" 就不处理了，否则手动对 ` 加 \ 转义
	      if (m.length % 2) {
	        m = '\\' + m;
	      }
	      return m;
	    });
	  },

	  escapeString: function escapeString(str_, isCode) {
	    var str = str_;
	    if (isCode) {
	      str = tools.escapeSingleQuoteInCodeString(str, 0);
	    } else {
	      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
	    }
	    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
	    return str;
	  },

	  pushToArray: function pushToArray(to, from) {
	    if (from) {
	      arrayPush.apply(to, from);
	    }
	  }
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*
	  Generated by kison.
	*/'use strict';var parser=(function(undefined){ /*jshint quotmark:false, loopfunc:true, indent:false, unused:false, asi:true, boss:true*/ /* Generated by kison */var parser={};var GrammarConst={'SHIFT_TYPE':1,'REDUCE_TYPE':2,'ACCEPT_TYPE':0,'TYPE_INDEX':0,'PRODUCTION_INDEX':1,'TO_INDEX':2};function peekStack(stack,n){n = n || 1;return stack[stack.length - n];} /*jslint quotmark: false*/ /*jslint quotmark: false*/function mix(to,from){for(var f in from) {to[f] = from[f];}}function isArray(obj){return '[object Array]' === Object.prototype.toString.call(obj);}function each(object,fn,context){if(object){var key,val,length,i=0;context = context || null;if(!isArray(object)){for(key in object) { // can not use hasOwnProperty
	if(fn.call(context,object[key],key,object) === false){break;}}}else {length = object.length;for(val = object[0];i < length;val = object[++i]) {if(fn.call(context,val,i,object) === false){break;}}}}}function inArray(item,arr){for(var i=0,l=arr.length;i < l;i++) {if(arr[i] === item){return true;}}return false;}var Lexer=function Lexer(cfg){var self=this; /*
	     lex rules.
	     @type {Object[]}
	     @example
	     [
	     {
	     regexp:'\\w+',
	     state:['xx'],
	     token:'c',
	     // this => lex
	     action:function(){}
	     }
	     ]
	     */ /*
	     lex rules.
	     @type {Object[]}
	     @example
	     [
	     {
	     regexp:'\\w+',
	     state:['xx'],
	     token:'c',
	     // this => lex
	     action:function(){}
	     }
	     ]
	     */self.rules = [];mix(self,cfg); /*
	     Input languages
	     @type {String}
	     */ /*
	     Input languages
	     @type {String}
	     */self.resetInput(self.input,self.filename);};Lexer.prototype = {'resetInput':function resetInput(input,filename){mix(this,{input:input,filename:filename,matched:'',stateStack:[Lexer.STATIC.INITIAL],match:'',text:'',firstLine:1,lineNumber:1,lastLine:1,firstColumn:1,lastColumn:1});},'getCurrentRules':function getCurrentRules(){var self=this,currentState=self.stateStack[self.stateStack.length - 1],rules=[]; //#JSCOVERAGE_IF
	//#JSCOVERAGE_IF
	if(self.mapState){currentState = self.mapState(currentState);}each(self.rules,function(r){var state=r.state || r[3];if(!state){if(currentState === Lexer.STATIC.INITIAL){rules.push(r);}}else if(inArray(currentState,state)){rules.push(r);}});return rules;},'pushState':function pushState(state){this.stateStack.push(state);},'popState':function popState(num){num = num || 1;var ret;while(num--) {ret = this.stateStack.pop();}return ret;},'showDebugInfo':function showDebugInfo(){var self=this,DEBUG_CONTEXT_LIMIT=Lexer.STATIC.DEBUG_CONTEXT_LIMIT,matched=self.matched,match=self.match,input=self.input;matched = matched.slice(0,matched.length - match.length); //#JSCOVERAGE_IF 0
	//#JSCOVERAGE_IF 0
	var past=(matched.length > DEBUG_CONTEXT_LIMIT?'...':'') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/g,' '),next=match + input; //#JSCOVERAGE_ENDIF
	//#JSCOVERAGE_ENDIF
	next = next.slice(0,DEBUG_CONTEXT_LIMIT).replace(/\n/g,' ') + (next.length > DEBUG_CONTEXT_LIMIT?'...':'');return past + next + '\n' + new Array(past.length + 1).join('-') + '^';},'mapSymbol':function mapSymbolForCodeGen(t){return this.symbolMap[t];},'mapReverseSymbol':function mapReverseSymbol(rs){var self=this,symbolMap=self.symbolMap,i,reverseSymbolMap=self.reverseSymbolMap;if(!reverseSymbolMap && symbolMap){reverseSymbolMap = self.reverseSymbolMap = {};for(i in symbolMap) {reverseSymbolMap[symbolMap[i]] = i;}} //#JSCOVERAGE_IF
	//#JSCOVERAGE_IF
	if(reverseSymbolMap){return reverseSymbolMap[rs];}else {return rs;}},'lex':function lex(){var self=this;var input=self.input;var rules=self.getCurrentRules();var i,rule,m,ret,lines;self.match = self.text = '';if(!input){return self.mapSymbol(Lexer.STATIC.END_TAG);}for(i = 0;i < rules.length;i++) {rule = rules[i]; //#JSCOVERAGE_IF 0
	//#JSCOVERAGE_IF 0
	var regexp=rule.regexp || rule[1];var token=rule.token || rule[0];var action=rule.action || rule[2] || undefined; //#JSCOVERAGE_ENDIF
	//#JSCOVERAGE_ENDIF
	if(m = input.match(regexp)){lines = m[0].match(/\n.*/g);if(lines){self.lineNumber += lines.length;}mix(self,{firstLine:self.lastLine,lastLine:self.lineNumber,firstColumn:self.lastColumn,lastColumn:lines?lines[lines.length - 1].length - 1:self.lastColumn + m[0].length});var match; // for error report
	// for error report
	match = self.match = m[0]; // all matches
	// all matches
	self.matches = m; // may change by user
	// may change by user
	self.text = match; // matched content utils now
	// matched content utils now
	self.matched += match;ret = action && action.call(self);if(ret === undefined){ret = token;}else {ret = self.mapSymbol(ret);}input = input.slice(match.length);self.input = input;if(ret){return ret;}else { // ignore
	return self.lex();}}}}};Lexer.STATIC = {'INITIAL':'I','DEBUG_CONTEXT_LIMIT':20,'END_TAG':'$EOF'};var lexer=new Lexer({'rules':[[0,/^[\s\S]*?(?={{)/,function(){var self=this,text=self.text,m,n=0;if(m = text.match(/\\+$/)){n = m[0].length;}if(n % 2){self.pushState('et');text = text.slice(0,-1);}else {self.pushState('t');}if(n){text = text.replace(/\\+$/g,function(m){return new Array(m.length / 2 + 1).join('\\');});} // https://github.com/kissyteam/kissy/issues/330
	// return even empty
	// https://github.com/kissyteam/kissy/issues/330
	// return even empty
	self.text = text;return 'CONTENT';}],['b',/^[\s\S]+/,0],['b',/^[\s\S]{2,}?(?:(?={{)|$)/,function popState(){this.popState();},['et']],['c',/^{{\{?~?(?:#|@)/,function(){var self=this,text=self.text;if(text.slice(0,3) === '{{{'){self.pushState('p');}else {self.pushState('e');}},['t']],['d',/^{{\{?~?\//,function(){var self=this,text=self.text;if(text.slice(0,3) === '{{{'){self.pushState('p');}else {self.pushState('e');}},['t']],['e',/^{{\s*else\s*}}/,function popState(){this.popState();},['t']],[0,/^{{![\s\S]*?}}/,function popState(){this.popState();},['t']],['b',/^{{%([\s\S]*?)%}}/,function(){ // return to content mode
	this.text = this.matches[1] || '';this.popState();},['t']],['f',/^{{\{?~?/,function(){var self=this,text=self.text;if(text.slice(0,3) === '{{{'){self.pushState('p');}else {self.pushState('e');}},['t']],[0,/^\s+/,0,['p','e']],['g',/^,/,0,['p','e']],['h',/^~?}}}/,function(){this.popState(2);},['p']],['h',/^~?}}/,function(){this.popState(2);},['e']],['i',/^\(/,0,['p','e']],['j',/^\)/,0,['p','e']],['k',/^\|\|/,0,['p','e']],['l',/^&&/,0,['p','e']],['m',/^===/,0,['p','e']],['n',/^!==/,0,['p','e']],['o',/^>=/,0,['p','e']],['p',/^<=/,0,['p','e']],['q',/^>/,0,['p','e']],['r',/^</,0,['p','e']],['s',/^\+/,0,['p','e']],['t',/^-/,0,['p','e']],['u',/^\*/,0,['p','e']],['v',/^\//,0,['p','e']],['w',/^%/,0,['p','e']],['x',/^!/,0,['p','e']],['y',/^"(\\[\s\S]|[^\\"\n])*"/,function(){this.text = this.text.slice(1,-1).replace(/\\"/g,'"');},['p','e']],['y',/^'(\\[\s\S]|[^\\'\n])*'/,function(){this.text = this.text.slice(1,-1).replace(/\\'/g,'\'');},['p','e']],['z',/^\d+(?:\.\d+)?(?:e-?\d+)?/i,0,['p','e']],['aa',/^=/,0,['p','e']],['ab',/^\.\./,function(){ // wait for '/'
	this.pushState('ws');},['p','e']],['ac',/^\//,function popState(){this.popState();},['ws']],['ac',/^\./,0,['p','e']],['ad',/^\[/,0,['p','e']],['ae',/^\]/,0,['p','e']],['af',/^\{/,0,['p','e']],['ag',/^\:/,0,['p','e']],['ah',/^\}/,0,['p','e']],['ab',/^[a-zA-Z_$][a-zA-Z0-9_$]*/,0,['p','e']]]});parser.lexer = lexer;lexer.symbolMap = {'$EOF':'a','CONTENT':'b','OPEN_BLOCK':'c','OPEN_CLOSE_BLOCK':'d','INVERSE':'e','OPEN_TPL':'f','COMMA':'g','CLOSE':'h','L_PAREN':'i','R_PAREN':'j','OR':'k','AND':'l','LOGIC_EQUALS':'m','LOGIC_NOT_EQUALS':'n','GE':'o','LE':'p','GT':'q','LT':'r','PLUS':'s','MINUS':'t','MULTIPLY':'u','DIVIDE':'v','MODULUS':'w','NOT':'x','STRING':'y','NUMBER':'z','EQUALS':'aa','ID':'ab','SEP':'ac','L_BRACKET':'ad','R_BRACKET':'ae','L_BRACE':'af','COLON':'ag','R_BRACE':'ah','$START':'ai','program':'aj','statements':'ak','statement':'al','function':'am','id':'an','expression':'ao','params':'ap','hash':'aq','param':'ar','conditionalOrExpression':'as','listExpression':'at','objectExpression':'au','objectPart':'av','conditionalAndExpression':'aw','equalityExpression':'ax','relationalExpression':'ay','additiveExpression':'az','multiplicativeExpression':'ba','unaryExpression':'bb','primaryExpression':'bc','hashSegment':'bd','idSegments':'be'};parser.productions = [['ai',['aj']],['aj',['ak','e','ak'],function(){return new this.yy.ProgramNode({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,this.$3);}],['aj',['ak'],function(){return new this.yy.ProgramNode({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1);}],['ak',['al'],function(){return [this.$1];}],['ak',['ak','al'],function(){var statements=this.$1;var statement=this.$2;if(statements.length){var lastStatement=statements[statements.length - 1];if(lastStatement.rtrim && statement && statement.type === 'contentStatement' && !statement.value.trim()){}else if(statement.ltrim && lastStatement && lastStatement.type === 'contentStatement' && !lastStatement.value.trim()){statements[statements.length - 1] = statement;}else {statements.push(statement);}}else {statements.push(statement);}}],['al',['c','am','h','aj','d','an','h'],function(){var program=this.$4;var openBlock=this.$1;var lastClose=this.$7;var statements=program.statements;var close=this.$3;var openCloseBlock=this.$5;if(close.indexOf('~}') !== -1 && statements[0] && statements[0].type === 'contentStatement'){if(!statements[0].value.trim()){statements.shift();}}if(openCloseBlock.indexOf('{~') !== -1 && statements[statements.length - 1] && statements[statements.length - 1].type === 'contentStatement'){if(!statements[statements.length - 1].value.trim()){statements.pop();}}var statement=new this.yy.BlockStatement({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$2,program,this.$6,this.$1.slice(0,3) !== '{{{');if(openBlock.indexOf('{~') !== -1){statement.ltrim = 1;}if(lastClose.indexOf('~}') !== -1){statement.rtrim = 1;}return statement;}],['al',['f','ao','h'],function(){var openTpl=this.$1;var close=this.$3;var statement=new this.yy.ExpressionStatement({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$2,this.$1.slice(0,3) !== '{{{');if(openTpl.indexOf('{~') !== -1){statement.ltrim = 1;}if(close.indexOf('~}') !== -1){statement.rtrim = 1;}return statement;}],['al',['b'],function(){return new this.yy.ContentStatement({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1);}],['am',['an','i','ap','g','aq','j'],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,this.$3,this.$5);}],['am',['an','i','ap','j'],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,this.$3);}],['am',['an','i','aq','j'],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,null,this.$3);}],['am',['an','i','j'],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1);}],['ap',['ap','g','ar'],function(){this.$1.push(this.$3);}],['ap',['ar'],function(){return [this.$1];}],['ar',['ao']],['ao',['as']],['ao',['ad','at','ae'],function(){return new this.yy.ArrayExpression(this.$2);}],['ao',['ad','ae'],function(){return new this.yy.ArrayExpression([]);}],['ao',['af','au','ah'],function(){return new this.yy.ObjectExpression(this.$2);}],['ao',['af','ah'],function(){return new this.yy.ObjectExpression([]);}],['av',['y','ag','ao'],function(){return [this.$1,this.$3];}],['av',['ab','ag','ao'],function(){return [this.$1,this.$3];}],['au',['av'],function(){return [this.$1];}],['au',['au','g','av'],function(){this.$1.push(this.$3);}],['at',['ao'],function(){return [this.$1];}],['at',['at','g','ao'],function(){this.$1.push(this.$3);}],['as',['aw']],['as',['as','k','aw'],function(){return new this.yy.ConditionalOrExpression(this.$1,this.$3);}],['aw',['ax']],['aw',['aw','l','ax'],function(){return new this.yy.ConditionalAndExpression(this.$1,this.$3);}],['ax',['ay']],['ax',['ax','m','ay'],function(){return new this.yy.EqualityExpression(this.$1,'===',this.$3);}],['ax',['ax','n','ay'],function(){return new this.yy.EqualityExpression(this.$1,'!==',this.$3);}],['ay',['az']],['ay',['ay','r','az'],function(){return new this.yy.RelationalExpression(this.$1,'<',this.$3);}],['ay',['ay','q','az'],function(){return new this.yy.RelationalExpression(this.$1,'>',this.$3);}],['ay',['ay','p','az'],function(){return new this.yy.RelationalExpression(this.$1,'<=',this.$3);}],['ay',['ay','o','az'],function(){return new this.yy.RelationalExpression(this.$1,'>=',this.$3);}],['az',['ba']],['az',['az','s','ba'],function(){return new this.yy.AdditiveExpression(this.$1,'+',this.$3);}],['az',['az','t','ba'],function(){return new this.yy.AdditiveExpression(this.$1,'-',this.$3);}],['ba',['bb']],['ba',['ba','u','bb'],function(){return new this.yy.MultiplicativeExpression(this.$1,'*',this.$3);}],['ba',['ba','v','bb'],function(){return new this.yy.MultiplicativeExpression(this.$1,'/',this.$3);}],['ba',['ba','w','bb'],function(){return new this.yy.MultiplicativeExpression(this.$1,'%',this.$3);}],['bb',['x','bb'],function(){return new this.yy.UnaryExpression(this.$1,this.$2);}],['bb',['t','bb'],function(){return new this.yy.UnaryExpression(this.$1,this.$2);}],['bb',['bc']],['bc',['y'],function(){return new this.yy.String({line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1);}],['bc',['z'],function(){return new this.yy.Number({line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1);}],['bc',['an']],['bc',['i','ao','j'],function(){return this.$2;}],['aq',['aq','g','bd'],function(){this.$1.value.push(this.$3);}],['aq',['bd'],function(){return new this.yy.Hash({line:this.lexer.firstLine,col:this.lexer.firstColumn},[this.$1]);}],['bd',['an','aa','ao'],function(){return [this.$1,this.$3];}],['an',['be'],function(){return new this.yy.Id({line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1);}],['be',['am'],function(){return [this.$1];}],['be',['be','ac','ab'],function(){this.$1.push(this.$3);}],['be',['be','ad','ao','ae'],function(){this.$1.push(this.$3);}],['be',['ab'],function(){return [this.$1];}]];parser.table = {'gotos':{'0':{'aj':4,'ak':5,'al':6},'2':{'am':8,'an':9,'be':10},'3':{'am':18,'an':19,'ao':20,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'5':{'al':30},'11':{'am':18,'an':19,'ao':35,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'12':{'am':18,'an':19,'bb':36,'bc':28,'be':10},'13':{'am':18,'an':19,'bb':37,'bc':28,'be':10},'16':{'am':18,'an':19,'ao':39,'as':21,'at':40,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'17':{'au':44,'av':45},'29':{'ak':60,'al':6},'31':{'aj':61,'ak':5,'al':6},'32':{'am':18,'an':63,'ao':64,'ap':65,'aq':66,'ar':67,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'bd':68,'be':10},'34':{'am':18,'an':19,'ao':70,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'47':{'am':18,'an':19,'aw':78,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'48':{'am':18,'an':19,'ax':79,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'49':{'am':18,'an':19,'ay':80,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'50':{'am':18,'an':19,'ay':81,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'51':{'am':18,'an':19,'az':82,'ba':26,'bb':27,'bc':28,'be':10},'52':{'am':18,'an':19,'az':83,'ba':26,'bb':27,'bc':28,'be':10},'53':{'am':18,'an':19,'az':84,'ba':26,'bb':27,'bc':28,'be':10},'54':{'am':18,'an':19,'az':85,'ba':26,'bb':27,'bc':28,'be':10},'55':{'am':18,'an':19,'ba':86,'bb':27,'bc':28,'be':10},'56':{'am':18,'an':19,'ba':87,'bb':27,'bc':28,'be':10},'57':{'am':18,'an':19,'bb':88,'bc':28,'be':10},'58':{'am':18,'an':19,'bb':89,'bc':28,'be':10},'59':{'am':18,'an':19,'bb':90,'bc':28,'be':10},'60':{'al':30},'72':{'am':18,'an':19,'ao':98,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'74':{'am':18,'an':19,'ao':99,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'75':{'am':18,'an':19,'ao':100,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'76':{'av':101},'91':{'am':18,'an':102,'be':10},'92':{'am':18,'an':19,'ao':103,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'be':10},'93':{'am':18,'an':63,'ao':64,'aq':104,'ar':105,'as':21,'aw':22,'ax':23,'ay':24,'az':25,'ba':26,'bb':27,'bc':28,'bd':68,'be':10},'95':{'am':18,'an':106,'bd':107,'be':10}},'action':{'0':{'b':[1,undefined,1],'c':[1,undefined,2],'f':[1,undefined,3]},'1':{'a':[2,7],'e':[2,7],'c':[2,7],'f':[2,7],'b':[2,7],'d':[2,7]},'2':{'ab':[1,undefined,7]},'3':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'4':{'a':[0]},'5':{'a':[2,2],'d':[2,2],'b':[1,undefined,1],'c':[1,undefined,2],'e':[1,undefined,29],'f':[1,undefined,3]},'6':{'a':[2,3],'e':[2,3],'c':[2,3],'f':[2,3],'b':[2,3],'d':[2,3]},'7':{'i':[2,59],'ac':[2,59],'ad':[2,59],'h':[2,59],'k':[2,59],'l':[2,59],'m':[2,59],'n':[2,59],'o':[2,59],'p':[2,59],'q':[2,59],'r':[2,59],'s':[2,59],'t':[2,59],'u':[2,59],'v':[2,59],'w':[2,59],'j':[2,59],'ae':[2,59],'g':[2,59],'aa':[2,59],'ah':[2,59]},'8':{'i':[2,56],'ac':[2,56],'ad':[2,56],'h':[1,undefined,31]},'9':{'i':[1,undefined,32]},'10':{'i':[2,55],'h':[2,55],'k':[2,55],'l':[2,55],'m':[2,55],'n':[2,55],'o':[2,55],'p':[2,55],'q':[2,55],'r':[2,55],'s':[2,55],'t':[2,55],'u':[2,55],'v':[2,55],'w':[2,55],'j':[2,55],'ae':[2,55],'g':[2,55],'aa':[2,55],'ah':[2,55],'ac':[1,undefined,33],'ad':[1,undefined,34]},'11':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'12':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'13':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'14':{'h':[2,48],'k':[2,48],'l':[2,48],'m':[2,48],'n':[2,48],'o':[2,48],'p':[2,48],'q':[2,48],'r':[2,48],'s':[2,48],'t':[2,48],'u':[2,48],'v':[2,48],'w':[2,48],'j':[2,48],'ae':[2,48],'g':[2,48],'ah':[2,48]},'15':{'h':[2,49],'k':[2,49],'l':[2,49],'m':[2,49],'n':[2,49],'o':[2,49],'p':[2,49],'q':[2,49],'r':[2,49],'s':[2,49],'t':[2,49],'u':[2,49],'v':[2,49],'w':[2,49],'j':[2,49],'ae':[2,49],'g':[2,49],'ah':[2,49]},'16':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'ae':[1,undefined,38],'af':[1,undefined,17]},'17':{'y':[1,undefined,41],'ab':[1,undefined,42],'ah':[1,undefined,43]},'18':{'h':[2,56],'k':[2,56],'i':[2,56],'l':[2,56],'m':[2,56],'n':[2,56],'o':[2,56],'p':[2,56],'q':[2,56],'r':[2,56],'s':[2,56],'t':[2,56],'u':[2,56],'v':[2,56],'w':[2,56],'ac':[2,56],'ad':[2,56],'j':[2,56],'ae':[2,56],'g':[2,56],'aa':[2,56],'ah':[2,56]},'19':{'h':[2,50],'k':[2,50],'l':[2,50],'m':[2,50],'n':[2,50],'o':[2,50],'p':[2,50],'q':[2,50],'r':[2,50],'s':[2,50],'t':[2,50],'u':[2,50],'v':[2,50],'w':[2,50],'j':[2,50],'ae':[2,50],'g':[2,50],'ah':[2,50],'i':[1,undefined,32]},'20':{'h':[1,undefined,46]},'21':{'h':[2,15],'j':[2,15],'ae':[2,15],'g':[2,15],'ah':[2,15],'k':[1,undefined,47]},'22':{'h':[2,26],'k':[2,26],'j':[2,26],'ae':[2,26],'g':[2,26],'ah':[2,26],'l':[1,undefined,48]},'23':{'h':[2,28],'k':[2,28],'l':[2,28],'j':[2,28],'ae':[2,28],'g':[2,28],'ah':[2,28],'m':[1,undefined,49],'n':[1,undefined,50]},'24':{'h':[2,30],'k':[2,30],'l':[2,30],'m':[2,30],'n':[2,30],'j':[2,30],'ae':[2,30],'g':[2,30],'ah':[2,30],'o':[1,undefined,51],'p':[1,undefined,52],'q':[1,undefined,53],'r':[1,undefined,54]},'25':{'h':[2,33],'k':[2,33],'l':[2,33],'m':[2,33],'n':[2,33],'o':[2,33],'p':[2,33],'q':[2,33],'r':[2,33],'j':[2,33],'ae':[2,33],'g':[2,33],'ah':[2,33],'s':[1,undefined,55],'t':[1,undefined,56]},'26':{'h':[2,38],'k':[2,38],'l':[2,38],'m':[2,38],'n':[2,38],'o':[2,38],'p':[2,38],'q':[2,38],'r':[2,38],'s':[2,38],'t':[2,38],'j':[2,38],'ae':[2,38],'g':[2,38],'ah':[2,38],'u':[1,undefined,57],'v':[1,undefined,58],'w':[1,undefined,59]},'27':{'h':[2,41],'k':[2,41],'l':[2,41],'m':[2,41],'n':[2,41],'o':[2,41],'p':[2,41],'q':[2,41],'r':[2,41],'s':[2,41],'t':[2,41],'u':[2,41],'v':[2,41],'w':[2,41],'j':[2,41],'ae':[2,41],'g':[2,41],'ah':[2,41]},'28':{'h':[2,47],'k':[2,47],'l':[2,47],'m':[2,47],'n':[2,47],'o':[2,47],'p':[2,47],'q':[2,47],'r':[2,47],'s':[2,47],'t':[2,47],'u':[2,47],'v':[2,47],'w':[2,47],'j':[2,47],'ae':[2,47],'g':[2,47],'ah':[2,47]},'29':{'b':[1,undefined,1],'c':[1,undefined,2],'f':[1,undefined,3]},'30':{'a':[2,4],'e':[2,4],'c':[2,4],'f':[2,4],'b':[2,4],'d':[2,4]},'31':{'b':[1,undefined,1],'c':[1,undefined,2],'f':[1,undefined,3]},'32':{'i':[1,undefined,11],'j':[1,undefined,62],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'33':{'ab':[1,undefined,69]},'34':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'35':{'j':[1,undefined,71]},'36':{'h':[2,46],'k':[2,46],'l':[2,46],'m':[2,46],'n':[2,46],'o':[2,46],'p':[2,46],'q':[2,46],'r':[2,46],'s':[2,46],'t':[2,46],'u':[2,46],'v':[2,46],'w':[2,46],'j':[2,46],'ae':[2,46],'g':[2,46],'ah':[2,46]},'37':{'h':[2,45],'k':[2,45],'l':[2,45],'m':[2,45],'n':[2,45],'o':[2,45],'p':[2,45],'q':[2,45],'r':[2,45],'s':[2,45],'t':[2,45],'u':[2,45],'v':[2,45],'w':[2,45],'j':[2,45],'ae':[2,45],'g':[2,45],'ah':[2,45]},'38':{'h':[2,17],'j':[2,17],'ae':[2,17],'g':[2,17],'ah':[2,17]},'39':{'ae':[2,24],'g':[2,24]},'40':{'g':[1,undefined,72],'ae':[1,undefined,73]},'41':{'ag':[1,undefined,74]},'42':{'ag':[1,undefined,75]},'43':{'h':[2,19],'j':[2,19],'ae':[2,19],'g':[2,19],'ah':[2,19]},'44':{'g':[1,undefined,76],'ah':[1,undefined,77]},'45':{'ah':[2,22],'g':[2,22]},'46':{'a':[2,6],'e':[2,6],'c':[2,6],'f':[2,6],'b':[2,6],'d':[2,6]},'47':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'48':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'49':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'50':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'51':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'52':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'53':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'54':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'55':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'56':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'57':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'58':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'59':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7]},'60':{'a':[2,1],'d':[2,1],'b':[1,undefined,1],'c':[1,undefined,2],'f':[1,undefined,3]},'61':{'d':[1,undefined,91]},'62':{'h':[2,11],'i':[2,11],'ac':[2,11],'ad':[2,11],'k':[2,11],'l':[2,11],'m':[2,11],'n':[2,11],'o':[2,11],'p':[2,11],'q':[2,11],'r':[2,11],'s':[2,11],'t':[2,11],'u':[2,11],'v':[2,11],'w':[2,11],'j':[2,11],'ae':[2,11],'g':[2,11],'aa':[2,11],'ah':[2,11]},'63':{'g':[2,50],'j':[2,50],'k':[2,50],'l':[2,50],'m':[2,50],'n':[2,50],'o':[2,50],'p':[2,50],'q':[2,50],'r':[2,50],'s':[2,50],'t':[2,50],'u':[2,50],'v':[2,50],'w':[2,50],'i':[1,undefined,32],'aa':[1,undefined,92]},'64':{'g':[2,14],'j':[2,14]},'65':{'g':[1,undefined,93],'j':[1,undefined,94]},'66':{'g':[1,undefined,95],'j':[1,undefined,96]},'67':{'g':[2,13],'j':[2,13]},'68':{'j':[2,53],'g':[2,53]},'69':{'i':[2,57],'ac':[2,57],'ad':[2,57],'h':[2,57],'k':[2,57],'l':[2,57],'m':[2,57],'n':[2,57],'o':[2,57],'p':[2,57],'q':[2,57],'r':[2,57],'s':[2,57],'t':[2,57],'u':[2,57],'v':[2,57],'w':[2,57],'j':[2,57],'ae':[2,57],'g':[2,57],'aa':[2,57],'ah':[2,57]},'70':{'ae':[1,undefined,97]},'71':{'h':[2,51],'k':[2,51],'l':[2,51],'m':[2,51],'n':[2,51],'o':[2,51],'p':[2,51],'q':[2,51],'r':[2,51],'s':[2,51],'t':[2,51],'u':[2,51],'v':[2,51],'w':[2,51],'j':[2,51],'ae':[2,51],'g':[2,51],'ah':[2,51]},'72':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'73':{'h':[2,16],'j':[2,16],'ae':[2,16],'g':[2,16],'ah':[2,16]},'74':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'75':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'76':{'y':[1,undefined,41],'ab':[1,undefined,42]},'77':{'h':[2,18],'j':[2,18],'ae':[2,18],'g':[2,18],'ah':[2,18]},'78':{'h':[2,27],'k':[2,27],'j':[2,27],'ae':[2,27],'g':[2,27],'ah':[2,27],'l':[1,undefined,48]},'79':{'h':[2,29],'k':[2,29],'l':[2,29],'j':[2,29],'ae':[2,29],'g':[2,29],'ah':[2,29],'m':[1,undefined,49],'n':[1,undefined,50]},'80':{'h':[2,31],'k':[2,31],'l':[2,31],'m':[2,31],'n':[2,31],'j':[2,31],'ae':[2,31],'g':[2,31],'ah':[2,31],'o':[1,undefined,51],'p':[1,undefined,52],'q':[1,undefined,53],'r':[1,undefined,54]},'81':{'h':[2,32],'k':[2,32],'l':[2,32],'m':[2,32],'n':[2,32],'j':[2,32],'ae':[2,32],'g':[2,32],'ah':[2,32],'o':[1,undefined,51],'p':[1,undefined,52],'q':[1,undefined,53],'r':[1,undefined,54]},'82':{'h':[2,37],'k':[2,37],'l':[2,37],'m':[2,37],'n':[2,37],'o':[2,37],'p':[2,37],'q':[2,37],'r':[2,37],'j':[2,37],'ae':[2,37],'g':[2,37],'ah':[2,37],'s':[1,undefined,55],'t':[1,undefined,56]},'83':{'h':[2,36],'k':[2,36],'l':[2,36],'m':[2,36],'n':[2,36],'o':[2,36],'p':[2,36],'q':[2,36],'r':[2,36],'j':[2,36],'ae':[2,36],'g':[2,36],'ah':[2,36],'s':[1,undefined,55],'t':[1,undefined,56]},'84':{'h':[2,35],'k':[2,35],'l':[2,35],'m':[2,35],'n':[2,35],'o':[2,35],'p':[2,35],'q':[2,35],'r':[2,35],'j':[2,35],'ae':[2,35],'g':[2,35],'ah':[2,35],'s':[1,undefined,55],'t':[1,undefined,56]},'85':{'h':[2,34],'k':[2,34],'l':[2,34],'m':[2,34],'n':[2,34],'o':[2,34],'p':[2,34],'q':[2,34],'r':[2,34],'j':[2,34],'ae':[2,34],'g':[2,34],'ah':[2,34],'s':[1,undefined,55],'t':[1,undefined,56]},'86':{'h':[2,39],'k':[2,39],'l':[2,39],'m':[2,39],'n':[2,39],'o':[2,39],'p':[2,39],'q':[2,39],'r':[2,39],'s':[2,39],'t':[2,39],'j':[2,39],'ae':[2,39],'g':[2,39],'ah':[2,39],'u':[1,undefined,57],'v':[1,undefined,58],'w':[1,undefined,59]},'87':{'h':[2,40],'k':[2,40],'l':[2,40],'m':[2,40],'n':[2,40],'o':[2,40],'p':[2,40],'q':[2,40],'r':[2,40],'s':[2,40],'t':[2,40],'j':[2,40],'ae':[2,40],'g':[2,40],'ah':[2,40],'u':[1,undefined,57],'v':[1,undefined,58],'w':[1,undefined,59]},'88':{'h':[2,42],'k':[2,42],'l':[2,42],'m':[2,42],'n':[2,42],'o':[2,42],'p':[2,42],'q':[2,42],'r':[2,42],'s':[2,42],'t':[2,42],'u':[2,42],'v':[2,42],'w':[2,42],'j':[2,42],'ae':[2,42],'g':[2,42],'ah':[2,42]},'89':{'h':[2,43],'k':[2,43],'l':[2,43],'m':[2,43],'n':[2,43],'o':[2,43],'p':[2,43],'q':[2,43],'r':[2,43],'s':[2,43],'t':[2,43],'u':[2,43],'v':[2,43],'w':[2,43],'j':[2,43],'ae':[2,43],'g':[2,43],'ah':[2,43]},'90':{'h':[2,44],'k':[2,44],'l':[2,44],'m':[2,44],'n':[2,44],'o':[2,44],'p':[2,44],'q':[2,44],'r':[2,44],'s':[2,44],'t':[2,44],'u':[2,44],'v':[2,44],'w':[2,44],'j':[2,44],'ae':[2,44],'g':[2,44],'ah':[2,44]},'91':{'ab':[1,undefined,7]},'92':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'93':{'i':[1,undefined,11],'t':[1,undefined,12],'x':[1,undefined,13],'y':[1,undefined,14],'z':[1,undefined,15],'ab':[1,undefined,7],'ad':[1,undefined,16],'af':[1,undefined,17]},'94':{'h':[2,9],'i':[2,9],'ac':[2,9],'ad':[2,9],'k':[2,9],'l':[2,9],'m':[2,9],'n':[2,9],'o':[2,9],'p':[2,9],'q':[2,9],'r':[2,9],'s':[2,9],'t':[2,9],'u':[2,9],'v':[2,9],'w':[2,9],'j':[2,9],'ae':[2,9],'g':[2,9],'aa':[2,9],'ah':[2,9]},'95':{'ab':[1,undefined,7]},'96':{'h':[2,10],'i':[2,10],'ac':[2,10],'ad':[2,10],'k':[2,10],'l':[2,10],'m':[2,10],'n':[2,10],'o':[2,10],'p':[2,10],'q':[2,10],'r':[2,10],'s':[2,10],'t':[2,10],'u':[2,10],'v':[2,10],'w':[2,10],'j':[2,10],'ae':[2,10],'g':[2,10],'aa':[2,10],'ah':[2,10]},'97':{'i':[2,58],'ac':[2,58],'ad':[2,58],'h':[2,58],'k':[2,58],'l':[2,58],'m':[2,58],'n':[2,58],'o':[2,58],'p':[2,58],'q':[2,58],'r':[2,58],'s':[2,58],'t':[2,58],'u':[2,58],'v':[2,58],'w':[2,58],'j':[2,58],'ae':[2,58],'g':[2,58],'aa':[2,58],'ah':[2,58]},'98':{'ae':[2,25],'g':[2,25]},'99':{'ah':[2,20],'g':[2,20]},'100':{'ah':[2,21],'g':[2,21]},'101':{'ah':[2,23],'g':[2,23]},'102':{'h':[1,undefined,108],'i':[1,undefined,32]},'103':{'j':[2,54],'g':[2,54]},'104':{'g':[1,undefined,95],'j':[1,undefined,109]},'105':{'g':[2,12],'j':[2,12]},'106':{'i':[1,undefined,32],'aa':[1,undefined,92]},'107':{'j':[2,52],'g':[2,52]},'108':{'a':[2,5],'e':[2,5],'c':[2,5],'f':[2,5],'b':[2,5],'d':[2,5]},'109':{'h':[2,8],'i':[2,8],'ac':[2,8],'ad':[2,8],'k':[2,8],'l':[2,8],'m':[2,8],'n':[2,8],'o':[2,8],'p':[2,8],'q':[2,8],'r':[2,8],'s':[2,8],'t':[2,8],'u':[2,8],'v':[2,8],'w':[2,8],'j':[2,8],'ae':[2,8],'g':[2,8],'aa':[2,8],'ah':[2,8]}}};parser.parse = function parse(input,filename){var state,symbol,ret,action,$$;var self=this;var lexer=self.lexer;var table=self.table;var gotos=table.gotos;var tableAction=table.action;var productions=self.productions; // for debug info
	// for debug info
	var prefix=filename?'in file: ' + filename + ' ':'';var valueStack=[];var stateStack=[0];var symbolStack=[];lexer.resetInput(input,filename);while(1) { // retrieve state number from top of stack
	state = peekStack(stateStack);if(!symbol){symbol = lexer.lex();}if(symbol){ // read action for current state and first input
	action = tableAction[state] && tableAction[state][symbol];}else {action = null;}if(!action){var expected=[];var error; //#JSCOVERAGE_IF
	//#JSCOVERAGE_IF
	if(tableAction[state]){each(tableAction[state],function(v,symbolForState){action = v[GrammarConst.TYPE_INDEX];var map=[];map[GrammarConst.SHIFT_TYPE] = 'shift';map[GrammarConst.REDUCE_TYPE] = 'reduce';map[GrammarConst.ACCEPT_TYPE] = 'accept';expected.push(map[action] + ':' + self.lexer.mapReverseSymbol(symbolForState));});}error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');throw new Error(error);}switch(action[GrammarConst.TYPE_INDEX]){case GrammarConst.SHIFT_TYPE:symbolStack.push(symbol);valueStack.push(lexer.text); // push state
	// push state
	stateStack.push(action[GrammarConst.TO_INDEX]); // allow to read more
	// allow to read more
	symbol = null;break;case GrammarConst.REDUCE_TYPE:var production=productions[action[GrammarConst.PRODUCTION_INDEX]];var reducedSymbol=production.symbol || production[0];var reducedAction=production.action || production[2];var reducedRhs=production.rhs || production[1];var len=reducedRhs.length;$$ = peekStack(valueStack,len); // default to $$ = $1
	// default to $$ = $1
	ret = undefined;self.$$ = $$;for(var i=0;i < len;i++) {self['$' + (len - i)] = peekStack(valueStack,i + 1);}if(reducedAction){ret = reducedAction.call(self);}if(ret !== undefined){$$ = ret;}else {$$ = self.$$;}var reverseIndex=len * -1;stateStack.splice(reverseIndex,len);valueStack.splice(reverseIndex,len);symbolStack.splice(reverseIndex,len);symbolStack.push(reducedSymbol);valueStack.push($$);var newState=gotos[peekStack(stateStack)][reducedSymbol];stateStack.push(newState);break;case GrammarConst.ACCEPT_TYPE:return $$;}}};return parser;})();if(true){module.exports = parser;}

/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * Ast node class for xtemplate
	 */

	'use strict';

	var ast = {};

	function sameArray(a1, a2) {
	  var l1 = a1.length;
	  var l2 = a2.length;
	  if (l1 !== l2) {
	    return 0;
	  }
	  for (var i = 0; i < l1; i++) {
	    if (a1[i] !== a2[i]) {
	      return 0;
	    }
	  }
	  return 1;
	}

	ast.ProgramNode = function (pos, statements, inverse) {
	  var self = this;
	  self.pos = pos;
	  self.statements = statements;
	  self.inverse = inverse;
	};

	ast.ProgramNode.prototype.type = 'program';

	ast.BlockStatement = function (pos, func, program, close, escape) {
	  var closeParts = close.parts;
	  var self = this;
	  var e = undefined;
	  // no close tag
	  if (!sameArray(func.id.parts, closeParts)) {
	    e = 'in file: ' + pos.filename + ' syntax error at line ' + pos.line + ', col ' + pos.col + ':\n' + 'expect {{/' + func.id.parts + '}} not {{/' + closeParts + '}}';
	    throw new Error(e);
	  }
	  self.escape = escape;
	  self.pos = pos;
	  self.func = func;
	  self.program = program;
	};

	ast.BlockStatement.prototype.type = 'blockStatement';

	ast.ExpressionStatement = function (pos, expression, escape) {
	  var self = this;
	  self.pos = pos;
	  self.value = expression;
	  self.escape = escape;
	};

	ast.ExpressionStatement.prototype.type = 'expressionStatement';

	ast.ContentStatement = function (pos, value) {
	  var self = this;
	  self.pos = pos;
	  self.value = value || '';
	};

	ast.ContentStatement.prototype.type = 'contentStatement';

	ast.UnaryExpression = function (unaryType, v) {
	  this.value = v;
	  this.unaryType = unaryType;
	};

	ast.Function = function (pos, id, params, hash) {
	  var self = this;
	  self.pos = pos;
	  self.id = id;
	  self.params = params;
	  self.hash = hash;
	};

	ast.Function.prototype.type = 'function';

	ast.UnaryExpression.prototype.type = 'unaryExpression';

	ast.MultiplicativeExpression = function (op1, opType, op2) {
	  var self = this;
	  self.op1 = op1;
	  self.opType = opType;
	  self.op2 = op2;
	};

	ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';

	ast.AdditiveExpression = function (op1, opType, op2) {
	  var self = this;
	  self.op1 = op1;
	  self.opType = opType;
	  self.op2 = op2;
	};

	ast.AdditiveExpression.prototype.type = 'additiveExpression';

	ast.RelationalExpression = function (op1, opType, op2) {
	  var self = this;
	  self.op1 = op1;
	  self.opType = opType;
	  self.op2 = op2;
	};

	ast.RelationalExpression.prototype.type = 'relationalExpression';

	ast.EqualityExpression = function (op1, opType, op2) {
	  var self = this;
	  self.op1 = op1;
	  self.opType = opType;
	  self.op2 = op2;
	};

	ast.EqualityExpression.prototype.type = 'equalityExpression';

	ast.ConditionalAndExpression = function (op1, op2) {
	  var self = this;
	  self.op1 = op1;
	  self.op2 = op2;
	  self.opType = '&&';
	};

	ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

	ast.ConditionalOrExpression = function (op1, op2) {
	  var self = this;
	  self.op1 = op1;
	  self.op2 = op2;
	  self.opType = '||';
	};

	ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

	ast.String = function (pos, value) {
	  var self = this;
	  self.pos = pos;
	  self.value = value;
	};

	ast.String.prototype.type = 'string';

	ast.Number = function (pos, value) {
	  var self = this;
	  self.pos = pos;
	  self.value = value;
	};

	ast.Number.prototype.type = 'number';

	ast.Hash = function (pos, value) {
	  var self = this;
	  self.pos = pos;
	  self.value = value;
	};

	ast.Hash.prototype.type = 'hash';

	ast.ArrayExpression = function (list) {
	  this.list = list;
	};

	ast.ArrayExpression.prototype.type = 'arrayExpression';

	ast.ObjectExpression = function (obj) {
	  this.obj = obj;
	};

	ast.ObjectExpression.prototype.type = 'objectExpression';

	ast.Id = function (pos, raw) {
	  var self = this;
	  var parts = [];
	  var depth = 0;
	  self.pos = pos;
	  for (var i = 0, l = raw.length; i < l; i++) {
	    var p = raw[i];
	    if (p === '..') {
	      depth++;
	    } else {
	      parts.push(p);
	    }
	  }
	  self.parts = parts;
	  self.string = parts.join('.');
	  self.depth = depth;
	};

	ast.Id.prototype.type = 'id';

	module.exports = ast;

/***/ }
/******/ ])
});
;