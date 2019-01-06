const fs = require('fs');
const util = require('util');
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
    //const html = await readFile('./index.html');
    res.sendFile(process.cwd() + '/index.html');
  });

  app.post('/login', async (req, res) => {
    console.log('----login post---');
    if (req.body.login && req.body.login === 'admin' && req.body.password && req.body.password === 'test') {
      //res.cookie('user', 'tobi', { domain: '.example.com', path: '/admin', secure: true });
      res.cookie('user', 'tobi', {});
      res.send('succesfull login');
    } else {
      res.sendFile(process.cwd() + '/index.html');
    }
  });

  app.get('/', async (req, res) => {
    res.send('Main page');
  });

  app.post('/', async (req, res) => {
   /**
    * TODO
    * check permissions
    * check JSON
    * save JSON to config
    * - edit repo lists
    * - edit users list
    * - set scheduler
    */
  });
};
