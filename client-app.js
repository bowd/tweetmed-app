var $ = require('jquery-browserify');
var bj = require('browserijade').renderFile;
var socket = io.connect('http://localhost:3000/');

/* Function definitions for the entities */

/* General functions that could be referenced as placeholders later. */
function log(msg) {
  $('div.log').append(msg+"</br>");
}

var general_functions = {
};

/* Functions object for all clickable html entities */
functions = {
  'startSearch': function() {
    var q = $("input#search-ter,").val();
    if (q !== "") { socket.emit('search', {phrase: $("input#search-term").val()}); }
  }
};

/* Socket handled returns */
socket.on('search-ret', function(data) {
  log(JSON.stringify(data, null, '\t'));
});










/* Main block to be executed when page loads. Sets bindings for click on 
 * clickable entities that emloy a 'func' attribute. 
 */

$(function() {

$("*[func]").click(function(e) {
  var funcString = $(e.target).attr('func');
  var attrObject = function(attrString) {
    if (attrString !== undefined && attrString != 'null')
    { return eval('('+attrString+')'); }
    return undefined; 
  }($(e.target).attr('arg'));

  var retBefore = function(funcBefString) {
    if (funcBefString in functions)
    { return functions[funcBefString](attrObject); }
    return undefined;
  }(funcString+'-before');
  
  var retFunc = function(funcString) {
    if (funcString in functions)
    { return functions[funcString](attrObject, retBefore); }
    alert('ERROR: Functions not defined! ('+funcString+')');
    return undefined;
  }(funcString);

  (function(funcAftString) {
    if (funcAftString in functions)
    { functions[funcAftString](attrObject, retBefore, retFunc); }
  })(funcString+'-after');
});

});
