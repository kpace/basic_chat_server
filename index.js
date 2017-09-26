var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`A user with id ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`A user with id ${socket.id} disconnected`);
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000...');
});
