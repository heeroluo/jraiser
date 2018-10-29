var md5 = require('crypto/1.1/md5');
var sha1 = require('crypto/1.1/sha1');
var QUnit = window.QUnit;


var STR = 'The quick brown fox jumps over the lazy dog';

QUnit.test('md5', function(assert) {
	assert.strictEqual(md5(STR), '9e107d9d372bb6826bd81d3542a419d6');
});

QUnit.test('sha1', function(assert) {
	assert.strictEqual(sha1(STR), '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12');
});