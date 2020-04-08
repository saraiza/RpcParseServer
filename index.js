// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');


// Default db and server settings are for local dev. Heroku server
// provides environment variables to override.
var bProduction = process.env.PRODUCTION || false
var port = process.env.PORT || 1337; // For the Heroku server, you want to use the given port. 
var server = process.env.SERVER || "localhost";   // prefix is separate
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dev';
var appId = process.env.APP_ID || 'myAppId'
var masterKey = process.env.MASTER_KEY || '_the_master_key'

// Production or dev? We will generate some strings accordingly
var urlParseInternal = ''
var urlParsePublic = ''
var bAllowHttp = false
if(bProduction) {
  urlParseInternal = 'http://localhost:' + port
  urlParsePublic   = 'https://' + server
  bAllowHttp = true  // DON'T FORGET TO MAKE THIS FALSE!
} 
else {
  // local development work
  urlParseInternal = 'http://localhost:' + port
  urlParsePublic   = 'http://' + server + ':' + port
  bAllowHttp = true
}


// Handy dumpage for now
console.log('Env Variables:');
console.log(' process.env.PRODUCTION: ' + process.env.PRODUCTION);
console.log(' process.env.SERVER: ' + process.env.SERVER);
console.log(' process.env.PORT: ' + process.env.PORT);
console.log(' process.env.DATABASE_URI: ' + process.env.DATABASE_URI);
console.log(' process.env.MONGODB_URI: ' + process.env.MONGODB_URI);
console.log('')
console.log('Resolved Parameters:');
console.log(' port: ' + port);
console.log(' urlParseInternal: ' + urlParseInternal);
console.log(' urlParsePublic: ' + urlParsePublic);
console.log(' databaseUri: ' + databaseUri);
console.log(' appId: ' + appId);
console.log(' masterKey: ' + masterKey); // Don't leave this enabled
console.log(' bAllowHttp: ' + bAllowHttp); 




// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey


var parse = new ParseServer({
  databaseURI: databaseUri,// || 'mongodb://mongolab-cubic-14202:27017/dev'
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: appId,
  masterKey: masterKey, //Add your master key here. Keep it secret!
  serverURL: urlParseInternal + '/parse',
  //publicServerURL: urlParsePublic  // Breaks deleting items from tables
  fileKey: 'optionalFileKey',
  revokeSessionOnPasswordReset: false,
  verbose: true,
  logLevel: "debug",
  port: port,
  enableAnonymousUsers: true, // DISABLE THIS
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});

var options = { allowInsecureHTTP: bAllowHttp };
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": urlParseInternal + '/parse', // Self-hosted Parse Server
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
app.use('/parse', parse);
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I sure wish I had a cookie');
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

