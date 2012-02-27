
/**
 * Module dependencies.
 */

var express = require('express')
  , sio = require('socket.io')
  , browserify = require('browserify')
  , bj = require('browserijade')
  , routes = require('./routes')
  , bundle = browserify().use(bj(__dirname + '/views/')).addEntry(__dirname + '/client-app.js')
  , redis = require("redis")
  , redis_pubsub = redis.createClient()
  , redis_publisher = redis.createClient();

redis_pubsub.on("error", function (err) {
    console.log("Error " + err);
});

redis_publisher.on("error", function (err) {
    console.log("Error " + err);
});


redis_pubsub.auth('jredis');
redis_publisher.auth('jredis');



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

function cleanString(str) {
  return str.replace(/[.,\[\]\(\)!?]/g, ' ');
}

var socket_from_id = [];

redis_pubsub.on("message", function(channel, message) {
  var msg = JSON.parse(message);
  console.log("Got back from term extraction: "+msg);
  socket_from_id[msg.socked_id].emit("search-ret", {entities: msg.entities});
});

redis_pubsub.subscribe("extract-terms-ret");


io.sockets.on('connection', function (socket) {
  socket_from_id[socket.id] = socket;
  socket.on('search', function (data) {
    console.log("pula");
    var msg =  JSON.stringify({phrase: data.phrase, socket_id: socket.id});
    console.log("Sending for term extraction: "+msg);
    redis_publisher.publish("extract-terms", msg);
  });
});
