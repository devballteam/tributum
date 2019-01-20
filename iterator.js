const config = require('./settings.json');
const gitService = require('./gitService.js');

module.exports = async (users, month, year) => {
  const today = new Date();
  const files = [];

  year = year || today.getFullYear();
  month = month || today.getMonth(); //previous month
  users = users || Object.keys(config.users);

  if (month === 0) {
    year--;
    month++;
  }
  month = ('0' + month).slice(-2);

  for (const user of users) {
    if (config.users[user]) {
      const output = `.temp_output/${user}-${month}-${year}.txt`;

      files.push(output);

      for (const email of config.users[user]) {
        await gitService(month, year, email, output);
      };
    }
  };
  return files;
}
