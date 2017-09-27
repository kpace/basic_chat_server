const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const bodyParser = require('body-parser');

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());

let people = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/enter', (req, res) => {
  people[req.body.id] = req.body.name;
  res.status(200).send();
});

io.on('connection', (socket) => {
  console.log(`A user with id ${socket.id} connected`);

  socket.on('message sent', (message) => {
    io.sockets.emit('message sent', {
      message,
      user: people[socket.id]
    });
  });

  socket.on('disconnect', () => {
    console.log(`A user with id ${socket.id} disconnected`);

    delete people[socket.id];
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000...');
});
