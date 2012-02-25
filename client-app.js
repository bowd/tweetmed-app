alert('pula');
var $ = require('jquery-browserify');
var jadeify = require('jadeify');

$(function() {
alert('pula');
$("span").click(function(e) {
  alert('pula');
  $("div#test").html( jadeify('_test.jade', {text: "Test text"}) );
});

});
