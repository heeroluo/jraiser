/* eslint-disable */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * simple facade for runtime and compiler
 */

var XTemplateRuntime = require('./runtime');
var util = XTemplateRuntime.util;
var Compiler = require('./compiler');
var _compile = Compiler.compile;

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
  var tplType = typeof tpl === 'undefined' ? 'undefined' : _typeof(tpl);
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

util.mix(XTemplate.prototype, {
  compile: function compile(content, name) {
    return _compile(content, name, this.config);
  },
  render: function render(data, option, callback_) {
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
  }
});

module.exports = util.mix(XTemplate, {
  globalConfig: {},

  config: XTemplateRuntime.config,

  compile: _compile,

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