const fs = require('fs');
const util = require('util');
const sha256 = require('crypto-js/sha256');
const readFile = util.promisify(fs.readFile);

module.exports = (app) => {
  app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/login');
  });

  app.get('/login', async (req, res) => {
    const message = req.query.message ?
      `<p class="${req.query.type}">${req.query.message}</p>` :
      '';
    let html = await readFile('./views/login.html');
    res.send(html.toString().replace(/{message}/g, message));
  });

  app.post('/login', async (req, res) => {
    if (req.body.login && req.body.login === admin.login && req.body.password && req.body.password === admin.password) {
      const timestamp = +(new Date());
      res.cookie('user', `${sha256(req.body.login + req.body.password + admin.secret + timestamp)}-${timestamp}`, { maxAge: 3600000 }); //maxAge 1 hour
      res.redirect('/');
    } else {
      res.redirect('/login?message="Wrong login or password&type=error');
    }
  });
};
