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

  socket.on('entered', function(users) {
    $('#name-container').hide();
    $('#chat-wrapper').show();
    refreshUsers(users);
  });

  socket.on('user entered', function(users) {
    refreshUsers(users);
  });

  socket.on('user left', function(users) {
    refreshUsers(users);
  });
 
  socket.on('message sent', function(data) {
    var p = $('<p>').text(data.user + ' said: ' + data.message);
    $('#message-container').append(p);
  });

  function refreshUsers(users) {
    $('#users').html('');
    Object.keys(users).forEach(function(key, index) {
      var name;
      name = users[key];
      if (key === socket.id) {
        name += ' (you)';
      }

      $('#users').append($('<li>').text(name));
    });
  }
});
