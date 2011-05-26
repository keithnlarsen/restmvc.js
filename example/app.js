var sys = require('sys');
var express = require('express');
var app = module.exports = express.createServer();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/restmvc');

app.configure('debug', function() {
    app.use(express.logger({ format: '\x1b[1m :date \x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms\x1b[0m :status' }));
});

app.configure(function() {
    app.set('root', __dirname);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

// This grabs the index.js file at the root and uses that
var restMvc = require('../');
restMvc.Initialize(app, mongoose);

app.error(restMvc.ErrorHandler);

app.use(function(req, res, next){
  next(restMvc.RestError.NotFound.create(req.url));
});

// example of how to throw a 404
app.get('/404', function(req, res, next){
  next(restMvc.RestError.NotFound.create(req.url));
});

// example of how to throw a 500
app.get('/500', function(req, res, next){
  next(new Error('keyboard cat!'));
});

if (!module.parent) {
    app.listen(3000);
    console.log('Server running at http://127.0.0.1:3000/' + '\r');
}
