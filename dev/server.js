import 'babel-polyfill';
import React from 'react'; // eslint-disable-line
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import { StaticRouter } from 'react-router-dom';
import multer from 'multer';
import path from 'path';
var mongoStore = require('connect-mongo')(session);
require('dotenv').load();

// File imports
import App from './js/components/App.js';
import Store from './store.js';
import routes from './js/routes/index.js';
require('./js/config/passport')(passport);

// Express app
var app = express();
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// Session
app.use(session({
  secret: 'secretKLM',
  resave: false,
  saveUninitialized: true,
  store: new mongoStore({ mongooseConnection: mongoose.connection })
}));

// File Upload
const storage = multer.diskStorage({
  destination: './src/uploads/',
  filename: function(req, file, cb) {
    cb(null, req.body.uid + Date.now().toString(36) + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1500000
  },
  fileFilter: function(req, file, cb) {
    switch(path.extname(file.originalname)) {
      case '.jpg':
      case '.png':
      case '.gif':
      case '.jpeg':
      case '.jpe':
        return cb(null, true);
    }
    cb(new Error('Invalid image file type.'));
  }
});


// Passport
app.use(passport.initialize());
app.use(passport.session());

// Other
app.use(bodyParser.urlencoded({ extended: true }));
app.enable('trust proxy');

// Static
app.use('/actions', express.static(process.cwd() + './js/actions'));
app.use('/components', express.static(process.cwd() + './js/components'));
app.use('/config', express.static(process.cwd() + './js/config'));
app.use('/containers', express.static(process.cwd() + './js/containers'));
app.use('/models', express.static(process.cwd() + './js/models'));
app.use('/reducers', express.static(process.cwd() + './js/reducers'));
app.use('/api', express.static(process.cwd() + './js/api'));
app.use('/src', express.static('src'));
app.use('/build', express.static('build'));
app.use('/dist', express.static('dist'));

// View engine ejs
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/../src');
app.set('view engine', 'html');

// Routes
routes(app, passport, upload);

// https://github.com/reactjs/redux/blob/master/docs/recipes/ServerRendering.md
app.use(handleRender);
function handleRender(req, res) {
  let initialState = {
    user: req.user
      || {
        uid: 'guest' + req.sessionID,
        username: 'Guest',
        usertag: 'User',
        guest: true
      }
  };

  const store = Store(initialState);
  const context = {};
  const title = 'Betterweb';
  const description = 'Help web developers make the web a better place by sharing your thoughts.';

  // StaticRouter for server side
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  );

  const preloadedState = store.getState();
  const clientSrc = process.env.NODE_ENV === 'production'
    ? '/dist/client.min.js'
    : '/build/client.js';

  res.send(renderFullPage(html, title, description, preloadedState, clientSrc));
}

function renderFullPage(html, title, description, preloadedState, clientSrc) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="/src/img/favicon.png">
        <title>${title}</title>
        <meta name="description" content="${description}">
        <script src="https://use.fontawesome.com/663123f680.js"></script>
        <link href="/src/css/index.css" rel="stylesheet" type="text/css">
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // http://redux.js.org/docs/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
        </script>
        <script src="${clientSrc}"></script>
      </body>
    </html>
  `;
}

var port = process.env.PORT || 8080;
app.listen(port);