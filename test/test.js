const should = require('should');
const io = require('socket.io-client');
const server = require('../app');

const PORT = 3333;
const socketURL = 'http://0.0.0.0:' + PORT.toString();
const options = {
  transports: ['websocket'],
  'force new connection': true
};

const connect = function() {
  return io.connect(socketURL, options);
};

describe('Testing Chat server', () => {
  before((done) => {
    server.start(PORT);
    done();
  });

  after((done) => {
    server.stop();
    done();
  });

  let user1, user2, user3;
  const name1 = 'John';
  const name2 = 'Jenny';
  const name3 = 'Jack';

  beforeEach((done) => {
    user1 = connect();
    user2 = connect();
    user3 = connect();
    done();
  });

  afterEach((done) => {
    user1.disconnect();
    user2.disconnect();
    user3.disconnect();
    done();
  });

  it('All users should be notified when a new user connects', (done) => {
    user1.emit('enter', {
      name: name1
    });

    user1.on('entered', () => {
      user2.emit('enter', {
        name: name2
      });

      user2.on('entered', () => {
        let user1Notified = false, user2Notified = false;

        user1.on('user entered', (user, users) => {
          if (user.name === name3) {
            user1Notified = true;
          }
          checkUserEntered(user, users);
        });
        user2.on('user entered', (user, users) => {
          if (user.name === name3) {
            user2Notified = true;
          }
          checkUserEntered(user, users);
        });

        function checkUserEntered(enteredUser, users) {
          if (enteredUser.name === name3) {
            users.should.have.property(user1.id, name1);
            users.should.have.property(user2.id, name2);
            users.should.have.property(user3.id, name3);

            if (user1Notified && user2Notified) {
              console.log('calling done');
              done();
            }
          }
        }
        user3.emit('enter', {
          name: name3
        });
      });
    });
  });

  it('All users should receive a message', (done) => {
    const message = "Hello there!";
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

    user1.emit('enter', {
      name: name1
    });

    user1.on('entered', () => {
      checkMessage(user1, user1.id, name1);
      user2.emit('enter', {
        name: name2
      });

      user2.on('entered', () => {
        checkMessage(user2, user1.id, name1);
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

  it('All users should receive a notification when user types', (done) => {
    let notificationCount = 0;
    function checkTyping(notifiedUser, typerName) {
      notifiedUser.on('typing', (name) => {
        notifiedUser.should.not.equal(name);
        typerName.should.not.equal(notifiedUser);
        typerName.should.equal(name);

        notificationCount++;
        if (notificationCount === 2) {
          done();
        }
      });
    }

    user1.emit('enter', {
      name: name1
    });

    user1.on('entered', () => {
      checkTyping(user1, name1);
      user1.emit('typing');

      user2.emit('enter', {
        name: name2
      });

      user2.on('entered', () => {
        checkTyping(user2, name1);
        user3.emit('enter', {
          name: name3
        });

        user3.on('entered', () => {
          checkTyping(user3, name1);
          user1.emit('typing');
        });
      });
    });
  });
});
