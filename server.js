const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3002;
const controller = require('./controller.js');
const websocket = require('./websocket.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sha256 = require("crypto-js/sha256");
global.admin = require('./config.json').admin;

function checkCookie (value) {
  const [hash, timestamp] = value.split('-');
  const validCookie = `${sha256(admin.login + admin.password + admin.secret + timestamp)}-${timestamp}`;

  return value === validCookie;
}
app.use('/assets', express.static(path.join(__dirname, 'public')))
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if ((req.cookies.user && checkCookie(req.cookies.user)) ||
    req.path === '/login') {
    next();
  } else {
    res.redirect('/login');
  }
});
controller(app);
websocket.startWebsocket(port + 100);

app.listen(port, () => console.log(`App started on port ${port}!`));
