const fs = require('fs');
const cwd = process.cwd();
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const iterator = require(`${cwd}/helpers/iterator.js`);
const scheduler = require(`${cwd}/services/scheduler.js`);
const getAndSendReports = require(`${cwd}/services/getAndSendReports.js`);
const previousMonthDate = require(`${cwd}/helpers/previousMonthDate.js`);
const logger = require(`${cwd}/helpers/logger`);
const mail = require(`${cwd}/services/mail.js`);
const settingsFilePath = `${cwd}/settings.json`;

module.exports = (app) => {
  app.get('/', async (req, res) => {
    const message = req.query.message ? `<p class="${req.query.type}">${req.query.message}</p>` : '';
    let html = await readFile('./views/index.html');
    let configData;
    let config = {};
    let authorsOptions = '';
    const { month, year} = previousMonthDate();

    try {
      configData = await readFile(settingsFilePath);
      config = JSON.parse(configData.toString());
      authorsOptions = Object.keys(config.users).map(value => `<option value=${value}>${value}</option>`);
    } catch (error) {
      config = JSON.stringify({}, null, 2);
      console.log('No config file');
    }

    res.send(html.toString()
      .replace(/{month}/g, month)
      .replace(/{year}/g, year)
      .replace(/{message}/g, message)
      .replace(/{settings}/g, JSON.stringify(config, null, 2))
      .replace(/{authorsOptions}/g, authorsOptions)
    );
  });

  app.post('/', async (req, res) => {
    let settings = null;
    try {
      settings = JSON.parse(req.body.settings);
      await writeFile(settingsFilePath, JSON.stringify(settings, null, 2));

      if (settings.schedule && settings.repos.length && settings.targetEmail) {
        scheduler.cancel();
        scheduler.run(settings.schedule, getAndSendReports);
      }

      res.redirect('/?message=Successful&type=success');
    } catch (error) {
      logger('JSON parse', error);
      res.redirect('/?message=Wrong JSON format&type=error');
    }
  });

  app.post('/report', async (req, res) => {
    //TODO
    const files = await iterator([req.body.author], req.body.month, req.body.year);
    const file = `${process.cwd()}/${files[0]}`;

    console.log('Done', file);
    res.download(file);
  });
};
