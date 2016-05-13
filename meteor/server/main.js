import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.publish('messagesGivenUser', function(userId) {
  return Messages.find({user: userId});
});

// This method can be called by HTTP POST (REST) or via DDP.
Meteor.method('authCheck', function() {
      if (!this.userId)
        throw new Meteor.Error(401,"Unauthorized","You need to authenticate first before calling this API method.");
      return 'Log in OK';
  },
  {
    url: 'api/authCheck'
  }
);

// The simplest way to test this out - to send the user an alert - is to do 
// curl -d "userId=ywerh23223h&message=HELLO" http://localhost:3000, but you'll need to comment out the authetication code first.
Meteor.method('sendMessage', function(data) {
  if (!this.userId)
    throw new Meteor.Error(401,"Unauthorized","You need to authenticate first before calling this API method.");
  // User's inbox has 'localId' going 0, 1, 2, ... so they can easily read/delete
  var num = Messages.find({user:data.userId}, {$fields: {'localId':1}, sort: {'localId':-1}}).fetch()[0].localId+1 || 0;
  var m = Messages.insert({user:data.userId, message: data.message, date: new Date(), localId:num, read: false});
  if (m)
    return {result:true,message:'Message sent',id:m};
},
{
  url: 'api/sendMessage'
});

Meteor.startup(() => {
  // Prevent all our collections being visible to everyone over REST.
  SimpleRest.configure({
    collections: []
  });
  // This 'method' can be called by HTTP GET (but not DDP).
  JsonRoutes.add("get","/api/getConfig", function(req, res, next) {
      JsonRoutes.sendResult(res, {data:{
        service : 'KaseLab',
        version : '0.0.1',
        requirements : [['email', 'password'],['token']],
        server : 'https://kaselab.com',
        protocol : 'ddp'
      }});
  });
  // You'll need to create a user for this 'headless' back-end - until there's another front end interface, do like this:
  // Accounts.createUser( {username: 'tom', email: 'tom.grek@gmail.com', password: '0xdeadbeef', profile: {} });
  // But only the first time you run meteor - after that creating the same user again will crash it.
  });
