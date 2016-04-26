'use strict';

var express = require('express');
var ejs = require('ejs');
var path = require('path');

loadEnv('.env');

var port = process.env.PORT || 8080;
var dist = parseInt(process.env.DIST, 10) === 1;
var rootURL = process.env.ROOT_URL || 'https://blockchain.info/';
var webSocketURL = process.env.WEBSOCKET_URL || false;
var apiDomain = process.env.API_DOMAIN;

// App configuration
var rootApp = express();
var app = express();
var assets = express();

app.use('/assets', assets);

rootApp.use('/wallet-beta', app);

app.use(function (req, res, next) {
  var cspHeader = ([
    "img-src 'self' " + rootURL + ' data:',
    // echo -n "outline: 0;" | openssl dgst -sha256 -binary | base64
    // "outline: 0;"        : ud+9... from ui-select
    // "margin-right: 10px" : 4If ... from ui-select
    // The above won't work in Chrome due to: https://bugs.chromium.org/p/chromium/issues/detail?id=571234
    // Safari throws the same error, but without suggesting an hash to whitelist.
    // Firefox appears to just allow unsafe-inline CSS
    "style-src 'self' 'uD+9kGdg1SXQagzGsu2+gAKYXqLRT/E07bh4OhgXN8Y=' '4IfJmohiqxpxzt6KnJiLmxBD72c3jkRoQ+8K5HT5K8o='",
    "child-src 'none'",
    "script-src 'self' 'sha256-mBeSvdVuQxRa2pGoL8lzKX14b2vKgssqQoW36iRlU9g=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
    "connect-src 'self' " + rootURL + ' ' + (webSocketURL || 'wss://*.blockchain.info') + ' ' + (apiDomain || 'https://api.blockchain.info'),
    "object-src 'none'",
    "media-src 'self' https://storage.googleapis.com/bc_public_assets/ data: mediastream: blob:",
    "font-src 'self'", ''
  ]).join('; ');
  res.setHeader('content-security-policy', cspHeader);
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if (dist) {
    res.render('index.html');
  } else {
    res.render('app/index.jade');
  }
});

assets.use(function (req, res, next) {
  if (dist) {
    res.setHeader('Cache-Control', 'public, max-age=31557600');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache');
  }
  next();
});

rootApp.use(function (req, res, next) {
  if (req.url === '/') {
    res.redirect('wallet-beta/');
  } else if (req.url === '/wallet-beta') {
    res.redirect('wallet-beta/');
  } else {
    next();
  }
});

if (dist) {
  console.log('Production mode: single javascript file, cached');
  app.engine('html', ejs.renderFile);
  assets.use(express.static('dist'));
  app.set('views', path.join(__dirname, 'dist'));
} else {
  console.log('Development mode: multiple javascript files, not cached');
  assets.use(express.static(__dirname));
  app.set('view engine', 'jade');
  app.set('views', __dirname);
}

assets.use(function (req, res) {
  res.status(404).send('<center><h1>404 Not Found</h1></center>');
});

rootApp.use(function (req, res) {
  res.status(404).send('<center><h1>404 Not Found</h1></center>');
});

app.use(function (req, res) {
  res.status(404).send('<center><h1>404 Not Found</h1></center>');
});

rootApp.listen(port, function () {
  console.log('Listening on %d', port);
});

// Helper functions
function loadEnv (envFile) {
  try {
    require('node-env-file')(envFile);
  } catch (e) {
    console.log('You may optionally create a .env file to configure the server.');
  }
}
