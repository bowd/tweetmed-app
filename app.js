
/**
 * Module dependencies.
 */

var express = require('express')
  , sio = require('socket.io')
  , browserify = require('browserify')
  , jadeify = require('jadeify')
  , routes = require('./routes')
  , bundle = browserify().use(jadeify(__dirname + '/views/')).addEntry(__dirname + '/client-app.js');


bundle.use(jadeify(__dirname + '/views'));

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.use(bundle);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Socket.IO Server

var io = sio.listen(app);

io.sockets.on('connection', function (socket) {
  socket.on('test', function (msg) {
    socket.emit('ret_test', { msg: 'received: '+msg });
  });
});
