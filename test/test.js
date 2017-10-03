const should = require('should');
const io = require('socket.io-client');
const server = require('../app');

var socketURL = 'http://0.0.0.0:3000';
var options = {
  transports: ['websocket'],
  'force new connection': true
};

var connect = function() {
  return io.connect(socketURL, options);
};

describe('Chat server', () => {
  before((done) => {
    server.start();
    done();
  });

  after((done) => {
    server.stop();
    done();
  });

  let user1, user2, user3;
  let name1 = 'John';
  let name2 = 'Jenny';
  let name3 = 'Jack';

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

  it('A user should be notified when new user connects', (done) => {
    user1.emit('enter', {
      name: name1
    });

    user1.on('entered', (users) => {
      users.should.have.property(user1.id, name1);
      users.should.not.have.property(user2.id);

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

  it('All users should receive a message', (done) => {
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
