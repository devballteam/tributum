const fs = require('fs');
const util = require('util');
const sha256 = require("crypto-js/sha256");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const iterator = require('./iterator.js');
const scheduler = require('./scheduler.js');
const mail = require('./mailService.js');
const settingsFilePath = './settings.json';

module.exports = (app) => {

  app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/login');
  });

  app.get('/login', async (req, res) => {
    const message = req.query.message ? `<p class="${req.query.type}">${req.query.message}</p>` : '';
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

  app.get('/', async (req, res) => {
    const message = req.query.message ? `<p class="${req.query.type}">${req.query.message}</p>` : '';
    let html = await readFile('./views/index.html');
    let configData;
    let config = {};
    let authorsOptions = '';
    const date = new Date();
    const month = date.getMonth() === 0 ? 12 : date.getMonth(); //previous month
    const year = month === 12 ? date.getFullYear() - 1 : date.getFullYear();

    try {
      configData = await readFile(settingsFilePath);
      config = JSON.parse(configData.toString());
      authorsOptions = Object.keys(config.users).map(value => `<option value=${value}>${value}</option>`);
    } catch (error) {
      config = JSON.stringify({}, null, 2);
      console.log('No config file');
    }
    console.log(message, config);

    res.send(html.toString()
      .replace(/{month}/g, month)
      .replace(/{year}/g, year)
      .replace(/{message}/g, message)
      .replace(/{settings}/g, JSON.stringify(config, null, 2))
      .replace(/{authorsOptions}/g, authorsOptions)
      .replace(/{logs}/g, '')
    );
  });

  app.post('/', async (req, res) => {
    let settings = null;
    try {
      settings = JSON.parse(req.body.settings);
      await writeFile(settingsFilePath, JSON.stringify(settings, null, 2));

      if (settings.schedule && settings.repos.length && settings.targetEmail && false) {
        scheduler.cancel();
        // '* * * 1 * *' - means run every first day of month
        scheduler.run(settings.schedule, async () => {
          const date = new Date();
          const month = date.getMonth() === 0 ? 12 : date.getMonth(); //previous month
          const year = month === 12 ? date.getFullYear() - 1 : date.getFullYear();
          const users = Object.keys(settings.users);
          const files = await iterator(users, month, year);
          const attachments = files.map(path => ({ path }));

          try {
            await mail(settings.targetEmail, `Git raport for ${month} ${year}`, attachments);
            console.log('Success mail sent to', settings.targetEmail);
          } catch (error) {
            console.log('Error', error);
          }
        });
      }

      res.redirect('/?message=Successful&type=success');
    } catch (error) {
      console.log('JSON parse', error);
      res.redirect('/?message=Wrong JSON format&type=error');
    }
  });

  app.post('/report', async (req, res) => {
    const files = await iterator([req.body.author], req.body.month, req.body.year);
    const file = `${process.cwd()}/${files[0]}`;

    console.log('Done', file);
    res.download(file);
  });
};
