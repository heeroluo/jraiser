var express = require('express');


// AJAX测试用例用到的接口
var ajaxRouter = express.Router();

ajaxRouter.get('/script/normal', function(req, res) {
	res.format({
		js: function() {
			res.end('window.testGetScript && testGetScript(' + JSON.stringify(req.query._) + ')');
		}
	});
});
ajaxRouter.get('/script/timeout', function(req, res) {
	setTimeout(function() {
		res.format({
			js: function() {
				res.end('window.testGetScript && testGetScript(' + JSON.stringify(req.query._) + ')');
			}
		});
	}, 3000);
});

ajaxRouter.get('/jsonp/normal', function(req, res) {
	res.jsonp([req.query.test, req.query._]);
});
ajaxRouter.get('/jsonp/timeout', function(req, res) {
	setTimeout(function() {
		res.jsonp('timeout');
	}, 3000);
});
ajaxRouter.post('/jsonp/post', function(req, res) {
	res.format({
		html: function() {
			res.end(`<script>parent[${ JSON.stringify(req.body.callback) }](${ JSON.stringify(req.body.test) })</script>`)
		}
	});
});

ajaxRouter.get('/xhr/get', function(req, res) {
	res.json({
		id: req.query.id
	});
});
ajaxRouter.get('/xhr/get/timeout', function(req, res) {
	setTimeout(function() {
		res.json('');
	}, 3000);
});
ajaxRouter.post('/xhr/post', function(req, res) {
	res.json({
		id: req.body.id
	});
});

ajaxRouter.put('/xhr/put', function(req, res) {
	res.json({
		id: req.body.id
	});
});
ajaxRouter.delete('/xhr/delete', function(req, res) {
	res.json({
		id: req.query.id
	});
});
ajaxRouter.delete('/xhr/delete/error', function(req, res) {
	res.status(403).json({
		message: 'Not allowed'
	});
});


module.exports = ajaxRouter;