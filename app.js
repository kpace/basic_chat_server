const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use('/public', express.static(__dirname + '/public'));

let users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('send a message', (message) => {
    if(!socket.id in users) {
      throw 'You should first enter your name';
    }
    // notify all users a meessage is sent
    io.sockets.emit('message sent', {
      message,
      user: {id: socket.id, name: users[socket.id]}
    });
  });

  socket.on('enter', (user) => {
    users[socket.id] = user.name;

    socket.emit('entered', users);
    // notify all users but current that a user has entered
    socket.broadcast.emit('user entered', users);
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', users[socket.id]);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    socket.broadcast.emit('user left', users);
  });
});

if (require.main === module) {
  start();
}

function start(port=3000, callback) {
  server.listen(port, () => {
    if (callback) {
      callback();
    }
  });
}

function stop() {
  io.close();
}

module.exports = {
  start: start,
  stop: stop
};
