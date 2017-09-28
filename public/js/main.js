$(function(){
  var socket = io();
  var $textInput = $('#text-input');
  var $sendButton = $('#send-button');

  var $nameInput = $('#name-input');
  var $enterButton = $('#enter-button');

  $enterButton.click(function() {
    var inputValue = $nameInput.val();
    if (inputValue) {
      socket.emit('enter', {
        id: socket.id,
        name: inputValue
      });
    }
  });

  $sendButton.click(function() {
    var inputValue = $textInput.val();
    if (inputValue) {
      socket.emit('message sent', inputValue);
      $textInput.val('');
    }
  });

  socket.on('entered', function() {
    $('#name-container').hide();
    $('#chat-wrapper').show();
  });

  socket.on('user entered', function(name) {
    $('#users').append($('<li>').text(name));
  });

  socket.on('message sent', function(data) {
    var p = $('<p>').text(data.user + ' said: ' + data.message);
    $('#message-container').append(p);
  });
});
