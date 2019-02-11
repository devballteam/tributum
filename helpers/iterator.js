const cwd = process.cwd();
const fs = require('fs');
const gitService = require(`${cwd}/services/git.js`);
const logger = require(`${cwd}/helpers/logger.js`);
const mail = require(`${cwd}/services/mail.js`);
const settings = require(`${cwd}/settings.json`);

module.exports = async (authors, dates) => {
  // Update repositories
  await settings.repos.forEach(async repo => {
    // Git update
    return gitService.updateRepositories(repo);
  });
  // Get report
  authors.forEach(async author => {
    dates.forEach(async date => {
      const { month, year } = date;
      const output = `${cwd}/.temp_output/${author}-${month}-${year}.txt`;
      settings.repos.forEach(async repo => {
        console.log('repo:', repo);
        // Git report
        await gitService.getReport({ author, repo, output, year, month });
      });
      // Send mail
      if (settings.targetEmail) {
        try {
          await mail(settings.targetEmail, `${author} Git raport for ${month} ${year}`, [{ path: output }]);
          logger('Success email sent to ' + settings.targetEmail);
        } catch (error) {
          logger('Error during sending email ' + error);
        }
      }
      fs.unlinkSync(output);
    });
  });
};
