// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');


// Default db and server settings are for local dev. Heroku server
// provides environment variables to override.
var port = process.env.PORT || 1337; // For the Heroku server, you want to use the given port. 
var serverUrlBase = process.env.SERVER_URL || "http://localhost"; // || 'https://apocalypse-rock-paper-scissors.herokuapp.com';
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dev';
var appId = process.env.APP_ID || 'myAppId'
var masterKey = process.env.MASTER_KEY || '_the_master_key'
var allowHttp = process.env.ALLOW_HTTP || true


// With the port appended
var serverUrlWithPort = serverUrlBase + ":" + port;

// Handy dumpage for now
console.log('Env Variables:');
console.log(' process.env.SERVER_URL: ' + process.env.SERVER_URL);
console.log(' process.env.PORT: ' + process.env.PORT);
console.log(' process.env.DATABASE_URI: ' + process.env.DATABASE_URI);
console.log(' process.env.MONGODB_URI: ' + process.env.MONGODB_URI);
console.log('')
console.log('Resolved Parameters:');
console.log(' port: ' + port);
console.log(' serverUrlBase: ' + serverUrlBase);
console.log(' serverUrlWithPort: ' + serverUrlWithPort);
console.log(' databaseUri: ' + databaseUri);
console.log(' appId: ' + appId);
console.log(' masterKey: ' + masterKey); // Don't leave this enabled
console.log(' allowHttp: ' + allowHttp); 




// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey


var api = new ParseServer({
  databaseURI: databaseUri,// || 'mongodb://mongolab-cubic-14202:27017/dev'
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: appId,
  masterKey: masterKey, //Add your master key here. Keep it secret!
  serverURL: serverUrlWithPort + '/parse',
  fileKey: 'optionalFileKey',
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});

var options = { allowInsecureHTTP: allowHttp };
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": serverUrlWithPort + '/parse', // Self-hosted Parse Server
      "appId": appId,
      "masterKey": masterKey,
      "appName": 'rpc'
    }
  ],  
  "users": [
    {
      "user":"saraiza",
      "pass":"f*ckingpassword"
    }
  ]
}, options);

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('RpcParseServer running on port ' + port + '.');
});

// This will enable the Live Query real-time server
//ParseServer.createLiveQueryServer(httpServer);
