const express = require('express');
const app = express();
const port = process.env.PORT || 3002;
const router = require('./router.js');
const scheduler = require('./scheduler.js');
const mail = require('./mailService.js');
const iterator = require('./iterator.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sha256 = require("crypto-js/sha256");
global.admin = require('./config.json').admin;

function checkCookie (value) {
  const [hash, timestamp] = value.split('-');
  const validCookie = `${sha256(admin.login + admin.password + admin.secret + timestamp)}-${timestamp}`;

  return value === validCookie;
}
app.use(express.static('public'));
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
router(app);
/*
 * TODO add scheduler
 * '* * * 1 * *' - means run every first day of month
 *
scheduler.run('* * * 1 * *', () => {
  iterator();
  const attachments = [{ path: 'package.json' }, { path: 'README.md' }];
  mail('mark.bogatzki@gmail.com', 'TEST', attachments).then(() => console.log('success'));
});
*/

app.listen(port, () => console.log(`App started on port ${port}!`));
