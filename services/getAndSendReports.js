const cwd = process.cwd();
const logger = require(`${cwd}/helpers/logger.js`);
const previousMonthDate = require(`${cwd}/helpers/previousMonthDate.js`);
const iterator = require(`${cwd}/helpers/iterator.js`);
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

module.exports = async () => {
  const { month, year} = previousMonthDate();
  const settings = require(`${cwd}/settings.json`);
  const users = Object.keys(settings.users);
  const files = await iterator(users, month, year);
  const attachments = files.map(path => ({ path }));

  if (settings.targetEmail) {
    try {
      await mail(settings.targetEmail, `Git raport for ${month} ${year}`, attachments);
      logger('Success email sent to', settings.targetEmail);
    } catch (error) {
      logger('Error during sending email', error);
    }
  }
}
