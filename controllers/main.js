const fs = require('fs');
const cwd = process.cwd();
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const logger = require(`${cwd}/helpers/logger.js`);
const scheduler = require(`${cwd}/services/scheduler.js`);
const settingsFilePath = `${cwd}/settings.json`;
const { getAndSendReportsForAuthor, getAndSendAllReports } = require(`${cwd}/helpers/utils.js`);

module.exports = (app) => {
  app.get('/', async (req, res) => {
    const message = req.query.message ? `<p class="${req.query.type}">${req.query.message}</p>` : '';
    let html = await readFile('./views/index.html');
    let configData;
    let config = {};
    let authorsOptions = '';

    try {
      configData = await readFile(settingsFilePath);
      config = JSON.parse(configData.toString());
      authorsOptions = Object.keys(config.authors).map(value => `<option value=${value}>${value}</option>`);
    } catch (error) {
      config = JSON.stringify({}, null, 2);
      console.log('No config file');
    }

    res.send(html.toString()
      //.replace(/{month}/g, month)
      //.replace(/{year}/g, year)
      .replace(/{message}/g, message)
      .replace(/{WS_ADDRESS}/g, req.hostname)
      .replace(/{settings}/g, JSON.stringify(config, null, 2))
      .replace(/{authorsOptions}/g, authorsOptions)
    );
  });

  app.post('/', async (req, res) => {
    let settings = null;
    try {
      // Save settings
      settings = JSON.parse(req.body.settings);
      await writeFile(settingsFilePath, JSON.stringify(settings, null, 2));

      // Restart scheduler
      if (settings.schedule && settings.repos.length && settings.targetEmail) {
        scheduler.cancel();
        scheduler.run(settings.schedule, getAndSendAllReports);
      }
      res.redirect('/?message=Successful&type=success');
    } catch (error) {
      console.log('JSON parse', error);
      res.redirect('/?message=Wrong JSON format&type=error');
    }
  });

  app.post('/report', async (req, res) => {
    getAndSendReportsForAuthor(req.body.author, req.body.dateFrom, req.body.dateTo);
    res.status(200);
  });
};
