const cwd = process.cwd();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3002;
const wsPort = process.env.WS_PORT || 3102;
const loginController = require(`${cwd}/controllers/login.js`);
const mainController = require(`${cwd}/controllers/main.js`);
const websocket = require(`${cwd}/websocket.js`);
const { reportsForAll, checkCookie, runSchedule, cancelSchedule } = require(`${cwd}/utils.js`);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const settings = require('./settings.json');

global.admin = settings.admin;

app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if ((req.cookies.user && checkCookie(req.cookies.user)) ||
    req.path === '/login') {
    next();
  } else {
    res.redirect('/login');
  }
});

loginController(app);
mainController(app);

websocket.startWebsocket(wsPort);

if (settings.schedule && settings.repos.length && settings.targetEmail) {
  cancelSchedule();
  runSchedule(settings.schedule, reportsForAll);
}

app.listen(port, () => console.log(`App started on port ${port}!`));
