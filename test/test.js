const should = require('should');
const io = require('socket.io-client');

var socketURL = 'http://0.0.0.0:3000';
var options = {
  transports: ['websocket'],
  'force new connection': true
};


describe('Chat server', () => {
  it('A user should receive all users on enter', (done) => {
    let name1 = 'John';
    let name2 = 'Jenny';

    let user1 = io.connect(socketURL, options);
    user1.on('connect', () => {
      user1.emit('enter', {
        name: name1
      });

      user1.on('entered', (users) => {
        let user2 = io.connect(socketURL, options);
        user2.on('connect', () => {
          user2.emit('enter', {
            name: name2
          });

          user1.on('user entered', (users) => {
            users.should.have.property(user1.id, name1);
            users.should.have.property(user2.id, name2);
            done();
          });
        });
      });
    });
  });
});
