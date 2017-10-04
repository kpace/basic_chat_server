$(function(){
  var socket = io();

  var $textInput = $('#text-input');
  var $sendButton = $('#send-button');

  var $nameInput = $('#name-input');
  var $enterButton = $('#enter-button');

  var timerId;

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

  $textInput.on('input', function() {
    socket.emit('typing');
  });

  socket.on('entered', function(users) {
    $('#name-container').hide();
    $('#chat-wrapper').show();
    $textInput.focus();
    refreshUsers(users);
  });

  socket.on('user entered', function(user, users) {
    refreshUsers(users);
  });

  socket.on('user left', function(users) {
    refreshUsers(users);
  });
 
  socket.on('message sent', function(data) {
    var user = data.user;
    var $messageContainer = $('#message-container');
    var p = $('<p>');

    if (user.id === socket.id) {
      p.text('You said: ' + data.message).addClass('italic');
    } else {
      p.text(user.name + ' said: ' + data.message);
    }

    $messageContainer.append(p);
    $messageContainer[0].scrollTop = $messageContainer[0].scrollHeight;
  });

  socket.on('typing', (user) => {
    var $typingIndicator = $('#typing-indicator');
    $typingIndicator.text(user + ' is typing...');

    if($typingIndicator.css('opacity') !== '1') {
      $typingIndicator.css({opacity: 1});
    }

    if(timerId) {
      clearInterval(timerId);
      timerId = undefined;
    }
    timerId = setTimeout(function() {
      $typingIndicator.css({opacity: 0});
    }, 600);
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
