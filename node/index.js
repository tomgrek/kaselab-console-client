var DDPClient = require('ddp');
var login = require('ddp-login');
var fs = require('fs');
var path = require('path');
var touch = require('touch');
var readline = require('readline');
var _ = require('underscore');

var ddpclient = new DDPClient({
  host : 'localhost',
  port : 3000
});

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var userId = ''; // client's userId is stored here on login
var messageWatcher; // watches for messages to this client's userId.
var home = process.env.HOME || process.env.USERPROFILE; // home directory - works on Win, Mac, Linux

var fileExists = function(filePath)
{
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
};

var loginWithPassword = function(callback) {
  login(ddpclient, {
    env: 'METEOR_TOKEN',
    method: 'account',
    account: null,
    pass: null,
    retry: 3,
    plaintext: false
  }, function(error, userInfo) {
    if (error) { console.log('Unable to log in - max retries exceeded'); process.exit(1); }
    userId = userInfo.id;
    touch(path.join(home, '.kaselab.conf'), {force:true});
    fs.writeFile(path.join(home,'.kaselab.conf'), JSON.stringify({userInfo:userInfo}), function(err)
      {
      if (err) { console.log('Unable to write config file at '+home+'/.kaselab.conf'); }
    });
    callback();
  });
};

var loginWithToken = function(token, callback) {
    login.loginWithToken(ddpclient, token, function(error, userInfo) {
      if (error) { console.log('Stored session is invalid - please log in again.'); loginWithPassword(callback); }
      else {
        userId = userInfo.id;
        callback();
      }
    });
};

var loginAction = function()
{
  ddpclient.call('authCheck', [''], function(err,result) {  console.log('Login result: '+result); });
  ddpclient.subscribe('messagesGivenUser', [userId], function() {
    messageWatcher = ddpclient.observe("messages");
    messageWatcher.added = function(id) {
      var fullMessage =  _.where(ddpclient.collections.messages, {_id:id})[0];
      alert("KaseLab: " + fullMessage.message + ' [' + fullMessage.localId + ']');
    }
  });
};

var alert = function(message)
{
  //invert line, save cursor position, move to 0,0, reset colors, revert cursor position
  rl.write('\u001b[7m\u001b\033[s\u001b[0;0H\u001b\033[K'+message+'\u001b[0m\u001b\033[u');
}

ddpclient.connect(function(error, wasReconnect) {
    //ddpclient.call('getConfig', [''], function(err,result) {  console.log(result); });
    if (fileExists(path.join(home,'.kaselab.conf'))) {
        var file = fs.readFileSync(path.join(home,'.kaselab.conf'));
        var userInfo = JSON.parse(file).userInfo;
        if (!userInfo) {
          loginWithPassword(function() { loginAction(); });
        }
        else {
        if (new Date(userInfo.tokenExpires) > new Date()) {
          console.log('\nLogging in to KaseLab with stored session...');
          loginWithToken(userInfo.token, function() { loginAction(); });
        }
        else {
          console.log('\nYour log in has expired - please log in again.');
          loginWithPassword(function() { ddpclient.call('authCheck', [''], function(err,result) {  console.log(result); }); });
        }
      } // JSON file ok
    } else {
        console.log('\nIt looks like you are using KaseLab from the shell for the first time, please log in.');
        loginWithPassword(function() { ddpclient.call('authCheck', [''], function(err,result) {  console.log(result); }); });
    }
});

//setTimeout(function() { messageWatcher.stop(); process.exit(0); }, 45000);
/*ddpclient.on('message', function (msg) {
  console.log("ddp message: " + msg);
});*/

//setTimeout(function() { ddpclient.close(); }, 5000);
