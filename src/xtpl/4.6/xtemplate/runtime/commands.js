/* eslint-disable */

/**
 * native commands for xtemplate.
 */

var Scope = require('./scope');
var util = require('./util');
var commands = {
  // range(start, stop, [step])
  range: function range(scope, option) {
    var params = option.params;
    var start = params[0];
    var end = params[1];
    var step = params[2];
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      if (typeof start !== 'number' || typeof end !== 'number' || step && typeof step !== 'number') {
        throw new Error('start/end/step of range must be type number!');
      }
    }
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
    var xcount = void 0;
    var opScope = void 0;
    var affix = void 0;
    var xindex = void 0;
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
    var opScope = void 0;
    var affix = void 0;
    var name = void 0;
    // if undefined, will emit warning by compiler
    if (param0) {
      for (name in param0) {
        if (param0.hasOwnProperty(name)) {
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
    var type = void 0;
    if (params.length === 2) {
      type = params[0];
      blockName = params[1];
    }
    var blocks = runtime.blocks = runtime.blocks || {};
    var head = blocks[blockName];
    var cursor = void 0;
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
        var prev = void 0;
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
      var paramNames = macro.paramNames;
      if (paramNames) {
        for (var i = 0, len = paramNames.length; i < len; i++) {
          var p = paramNames[i];
          paramValues[p] = params1[i];
        }
      }
      if (hash) {
        for (var h in hash) {
          if (hash.hasOwnProperty(h)) {
            paramValues[h] = hash[h];
          }
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

commands['debugger'] = function debuggerFn() {
  util.globalEval('debugger');
};

module.exports = commands;