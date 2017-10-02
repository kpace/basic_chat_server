$(function(){
  var socket = io();

  var $textInput = $('#text-input');
  var $sendButton = $('#send-button');

  var $nameInput = $('#name-input');
  var $enterButton = $('#enter-button');

  $nameInput.focus();
  attachClickOnEnter($textInput, $sendButton);
  attachClickOnEnter($nameInput, $enterButton);

  $enterButton.click(function() {
    var inputValue = $nameInput.val();
    if (inputValue) {
      socket.emit('enter', {
        name: inputValue
      });
    }
  });

  $sendButton.click(function() {
    var inputValue = $textInput.val();
    if (inputValue) {
      socket.emit('send a message', inputValue);
      $textInput.val('');
    }
  });

  socket.on('entered', function(users) {
    $('#name-container').hide();
    $('#chat-wrapper').show();
    $textInput.focus();
    refreshUsers(users);
  });

  socket.on('user entered', function(users) {
    refreshUsers(users);
  });

  socket.on('user left', function(users) {
    refreshUsers(users);
  });
 
  socket.on('message sent', function(data) {
    var user = data.user;
    var p = $('<p>');

    if (user.id === socket.id) {
      p.text('You said: ' + data.message).addClass('italic');
    } else {
      p.text(user.name + ' said: ' + data.message);
    }

    $('#message-container').append(p);
  });

  function attachClickOnEnter($input, $button) {
    $input.keyup(function(event) {
      if(event.keyCode == 13) {
          $button.click();
      }
    });
  }

  function refreshUsers(users) {
    $('#users').html('');
    Object.keys(users).forEach(function(key, index) {
      var name;
      name = users[key];
      if (key === socket.id) {
        name += ' (you)';
        $('#users').prepend($('<li>').text(name));
      } else {
        $('#users').append($('<li>').text(name));
      }
    });
  }
});
