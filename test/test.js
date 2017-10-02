const should = require('should');
const io = require('socket.io-client');

var socketURL = 'http://0.0.0.0:3000';
var options = {
  transports: ['websocket'],
  'force new connection': true
};

var connect = function() {
  return io.connect(socketURL, options);
};

describe('Chat server', () => {
  it('A user should be notified when new user connect', (done) => {
    let name1 = 'John';
    let name2 = 'Jenny';

    let user1 = connect();
    user1.on('connect', () => {
      user1.emit('enter', {
        name: name1
      });

      user1.on('entered', (users) => {
        let user2 = connect();

        users.should.have.property(user1.id, name1);
        users.should.not.have.property(user2.id);

        user2.on('connect', () => {
          user2.emit('enter', {
            name: name2
          });

          user1.on('user entered', (users) => {
            users.should.have.property(user1.id, name1);
            users.should.have.property(user2.id, name2);

            user1.disconnect();
            user2.disconnect();
            done();
          });
        });
      });
    });
  });

  it('All users should receive a message', (done) => {
    let name1 = 'John';
    let name2 = 'Jenny';
    let name3 = 'Jack';
    let message = "Hello there!";

    let messageCount = 0;
    function checkMessage(client, senderId, senderName) {
      client.on('message sent', (data) => {
        data.should.have.property('user');
        let sender = data.user;

        message.should.equal(data.message);
        sender.should.have.property('id', senderId);
        sender.should.have.property('name', senderName);

        messageCount++;
        if (messageCount === 3) {
          done();
        }
      });
    }

    let user1 = connect();
    user1.on('connect', () => {
      user1.emit('enter', {
        name: name1
      });

      user1.on('entered', () => {
        checkMessage(user1, user1.id, name1);
        let user2 = connect();
        user2.on('connect', () => {
          user2.emit('enter', {
            name: name2
          });

          user2.on('entered', () => {
            checkMessage(user2, user1.id, name1);
            let user3 = connect();
            user3.on('connect', () => {
              user3.emit('enter', {
                name: name3
              });

              user3.on('entered', () => {
                checkMessage(user3, user1.id, name1);
                user1.emit('send a message', message);
              });
            });
          });
        });
      });
    });
  });
});
