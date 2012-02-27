var sio = require('socket.io');

function socket_handler (app, rh) {
  this.io = sio.listen(app);
  this.redis_handler = rh;
  console.log(rh);

  this.search = function (data, socket) {
    var msg = JSON.stringify({phrase: data.phrase, socket_key: 'sock'+String(socket.id)});
    console.log("Sending for term extraction: "+msg);
    this.redis_handler.publish("extract-terms", msg);
  };
}

var sh;

exports.init = function(app, rh) {
  sh = new socket_handler(app, rh);
  sh.io.sockets.on('connection', function(socket) {
    sh.redis_handler.define_socket("sock"+String(socket.id), socket);
    /* Other start of connection stuff ... */

    /* Define events */
    socket.on('search', function(data) { sh.search(data, this); });
  });
};






