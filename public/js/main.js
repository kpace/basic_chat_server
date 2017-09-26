$(function(){
  var socket = io();
  var $textInput = $('#text-input');
  var $sendButton = $('#send-button');

  $sendButton.click(function() {
    var inputValue = $textInput.val();
    if (inputValue) {
      socket.emit('message sent', inputValue);
      $textInput.val('');
    }
  });

  socket.on('message sent', function(message) {
    var p = $('<p>').text(message);
    $('#message-container').append(p);
  });
});
