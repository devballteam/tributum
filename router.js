const fs = require('fs');
const util = require('util');
const sha256 = require("crypto-js/sha256");
const readFile = util.promisify(fs.readFile);
const iterator = require('./iterator.js');

module.exports = (app) => {
  app.get('/get', async (req, res) => {
    const users = (req.query.author || '').split(',');
    const files = await iterator(users, req.query.month, req.query.year);
    const file = `${process.cwd()}/${files[0]}`;

    console.log('Done', file);
    res.download(file);
  });

  app.get('/login', async (req, res) => {
    const loginError = req.query.error ? '<p>Wrong login or password</p>' : '';
    let html = await readFile('./index.html');
    res.send(html.toString().replace(/{loginError}/g, loginError));
  });

  app.post('/login', async (req, res) => {
    if (req.body.login && req.body.login === admin.login && req.body.password && req.body.password === admin.password) {
      const timestamp = +(new Date());
      res.cookie('user', `${sha256(req.body.login + req.body.password + admin.secret + timestamp)}-${timestamp}`, { maxAge: 3600000 }); //maxAge 1 hour
      res.status(200).send();
    } else {
      res.redirect('/login?error=404');
    }
  });

  app.get('/', async (req, res) => {
    res.send('Main page');
  });

  app.post('/', async (req, res) => {
   /**
    * TODO
    * check JSON
    * save JSON to config
    * - edit repo lists
    * - edit users list
    * - set scheduler
    */
  });
};
