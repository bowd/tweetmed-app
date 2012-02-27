var redis = require('redis');

function redis_handler(rps, rp) {
  this.redis_pubsub = rps;
  this.redis_publisher = rp;

  this.rps_error = function(msg) { console.log("(Redis) RPS-ERROR: "+msg); };
  this.rp_error  = function(msg) { console.log("(Redis) RP-ERROR: "+msg);  };

  this.redis_pubsub.on("error", this.rps_error);
  this.redis_publisher.on("error", this.rp_error);

  this.redis_pubsub.auth('jredis');
  this.redis_publisher.auth('jredis');


  this.sockets_list = [];
  this.define_socket = function(socket_key, socket) { 
    this.sockets_list[socket_key] = socket;
  };

  this.publish = function(channel, msg) {
    console.log("TEST");
    this.redis_publisher.publish(channel, msg);
  };
  
  this.message = function(channel, message) {
    var msg = JSON.parse(message);
    console.log("Got back grom term extraction: "+JSON.stringify(msg));
    this.sockets_list[msg.socket_key].emit("search-ret", msg.data);
  };


  this.redis_pubsub.subscribe("extract-terms-ret");
}

var rh = new redis_handler(redis.createClient(), redis.createClient());
rh.redis_pubsub.on("message", function(c,m) { rh.message(c,m); });

exports.define_socket = function(skey, s) { rh.define_socket(skey, s); };
exports.publish = function(c, m) { rh.publish(c, m); };





