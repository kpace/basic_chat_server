$(function(){
  var socket = io();
  var $textInput = $('#text-input');
  var $sendButton = $('#send-button');

  var $nameInput = $('#name-input');
  var $enterButton = $('#enter-button');

  $enterButton.click(function() {
    var inputValue = $nameInput.val();

    if (inputValue) {
      $.ajax({
        url: 'enter',
        type: "POST",
        data: JSON.stringify({
          id: socket.id,
          name: inputValue
        }),
        contentType: 'application/json'
      })
      .done(function() {
        $('#name-container').hide();
        $('#chat-container').show();
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

  socket.on('message sent', function(data) {
    var p = $('<p>').text(data.user + ' said: ' + data.message);
    $('#message-container').append(p);
  });
});
