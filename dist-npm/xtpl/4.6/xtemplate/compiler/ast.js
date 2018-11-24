/* eslint-disable */

/**
 * Ast node class for xtemplate
 */
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

ast.ProgramNode = function ProgramNode(pos, statements, inverse) {
  var self = this;
  self.pos = pos;
  self.statements = statements;
  self.inverse = inverse;
};

ast.ProgramNode.prototype.type = 'program';

ast.BlockStatement = function BlockStatement(pos, func, program, close, escape) {
  var closeParts = close.parts;
  var self = this;
  var e = void 0;
  // no close tag
  if (!sameArray(func.id.parts, closeParts)) {
    e = 'in file: ' + pos.filename + ' syntax error at line     ' + pos.line + ', col ' + pos.col + ':\n    expect {{/' + func.id.parts + '}} not {{/' + closeParts + '}}';
    throw new Error(e);
  }
  self.escape = escape;
  self.pos = pos;
  self.func = func;
  self.program = program;
};

ast.BlockStatement.prototype.type = 'blockStatement';

ast.ExpressionStatement = function ExpressionStatement(pos, expression, escape) {
  var self = this;
  self.pos = pos;
  self.value = expression;
  self.escape = escape;
};

ast.ExpressionStatement.prototype.type = 'expressionStatement';

ast.ContentStatement = function ContentStatement(pos, value) {
  var self = this;
  self.pos = pos;
  self.value = value || '';
};

ast.ContentStatement.prototype.type = 'contentStatement';

ast.UnaryExpression = function UnaryExpression(unaryType, v) {
  this.value = v;
  this.unaryType = unaryType;
};

ast.Function = function Function(pos, id, params, hash) {
  var self = this;
  self.pos = pos;
  self.id = id;
  self.params = params;
  self.hash = hash;
};

ast.Function.prototype.type = 'function';

ast.UnaryExpression.prototype.type = 'unaryExpression';

ast.MultiplicativeExpression = function MultiplicativeExpression(op1, opType, op2) {
  var self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';

ast.AdditiveExpression = function AdditiveExpression(op1, opType, op2) {
  var self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.AdditiveExpression.prototype.type = 'additiveExpression';

ast.RelationalExpression = function RelationalExpression(op1, opType, op2) {
  var self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.RelationalExpression.prototype.type = 'relationalExpression';

ast.EqualityExpression = function EqualityExpression(op1, opType, op2) {
  var self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.EqualityExpression.prototype.type = 'equalityExpression';

ast.ConditionalAndExpression = function ConditionalAndExpression(op1, op2) {
  var self = this;
  self.op1 = op1;
  self.op2 = op2;
  self.opType = '&&';
};

ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

ast.ConditionalOrExpression = function ConditionalOrExpression(op1, op2) {
  var self = this;
  self.op1 = op1;
  self.op2 = op2;
  self.opType = '||';
};

ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

ast.ConditionalExpression = function ConditionalExpression(op1, op2, op3) {
  var self = this;
  self.op1 = op1;
  self.op2 = op2;
  self.op3 = op3;
  self.opType = '?:';
};
ast.ConditionalExpression.prototype.type = 'conditionalExpression';

ast.String = function StringType(pos, value) {
  var self = this;
  self.pos = pos;
  self.value = value;
};

ast.String.prototype.type = 'string';

ast.Number = function NumberType(pos, value) {
  var self = this;
  self.pos = pos;
  self.value = value;
};

ast.Number.prototype.type = 'number';

ast.Hash = function Hash(pos, value) {
  var self = this;
  self.pos = pos;
  self.value = value;
};

ast.Hash.prototype.type = 'hash';

ast.ArrayExpression = function ArrayExpression(list) {
  this.list = list;
};

ast.ArrayExpression.prototype.type = 'arrayExpression';

ast.ObjectExpression = function ObjectExpression(obj) {
  this.obj = obj;
};

ast.ObjectExpression.prototype.type = 'objectExpression';

ast.Id = function Id(pos, raw) {
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