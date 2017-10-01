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
  console.log(`A user with id ${socket.id} connected`);

  socket.on('message sent', (message) => {
    // emit to all users that meessage is sent
    io.sockets.emit('message sent', {
      message,
      user: {id: socket.id, name: users[socket.id]}
    });
  });

  socket.on('enter', (user) => {
    users[user.id] = user.name;

    socket.emit('entered', users);
    socket.broadcast.emit('user entered', users);
  });

  socket.on('disconnect', () => {
    console.log(`A user with id ${socket.id} disconnected`);

    delete users[socket.id];
    socket.broadcast.emit('user left', users);
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000...');
});
