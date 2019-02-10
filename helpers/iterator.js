const cwd = process.cwd();
const gitService = require(`${cwd}/services/git.js`);
const config = require(`${cwd}/settings.json`);

module.exports = async (users, month, year) => {
  const files = [];

  if (month && year && users) {
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
  } else {
    return false;
  } 
}
