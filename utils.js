const cwd = process.cwd();
const execa = require('execa');
const fs = require('fs');
const util = require('util');
const logFile = `${cwd}/logs`;
const mail = require(`${cwd}/mail.js`);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const websocekt = require(`${cwd}/websocket.js`);
const schedule = require('node-schedule');
const sha256 = require('crypto-js/sha256');
const tempDir = `${cwd}/.temp`;

let scheduledTask;

async function getSettings () {
  const settingsFilePath = `${cwd}/settings.json`;
  let settings;
  try {
    const data = await readFile(settingsFilePath);
    settings = JSON.parse(data);
  } catch(error) {
    settings = {};
  }
  return settings;
}
/*
 * Logger
 */
function logger (message) {
  const date = new Date();
  const dateFormat = {
    year:   'numeric',
    month:  'numeric',
    day:    'numeric',
    hour:   'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  let output = `[${date.toLocaleDateString('pl', dateFormat)}] - ${message}`;

  if (fs.statSync(logFile).size > 5000) {
    let logData = fs.readFileSync(logFile,'utf8');
    fs.writeFileSync(logFile, logData.slice(logData.length/2), 'utf8');
  }

  output += '\n';
  // TODO log file rotation
  fs.appendFileSync(logFile, output);
  websocekt.sendToAll({ data: output });
};

/*
 * Set scheduler and log it
 */
function runSchedule (pattern, cb) {
  logger('Scheduler is set');
  scheduledTask = schedule.scheduleJob(pattern, () => {
    logger('Scheduler executes task');
    global.schedulerStatus = 'running';
    cb && cb();
    global.schedulerStatus = 'scheduled';
  });
};
/*
 * Cancel scheduler and log it
 */
function cancelSchedule () {
  logger('Scheduler is canceled');
  scheduledTask && scheduledTask.cancel();
  scheduledTask = undefined;
};

/*
 * Iterate over authors and dates and get reports
 */
async function generateReports (authors, dates) {
  const settings = await getSettings();
  // Update repositories
  for (repo of settings.repos) {
    // Git update
    let repoDir = `${tempDir}/${repo.replace('/','-')}`
    if (!fs.existsSync(tempDir)){
      fs.mkdirSync(tempDir);
    }
    if (fs.existsSync(repoDir)) {
      logger(`Fetching ${repo}…`);
      await execa.shell(`git --git-dir=${repoDir}/.git --work-tree=${repoDir}  fetch`);
    } else {
      logger(`Cloning ${repo}…`);
      await execa.shell(`git clone ${settings.url}/${repo}.git ${repoDir}`);
    }
  }
  // Get report
  for (author of authors) {
    for (date of dates) {
      const { month, year } = date;
      const [authorName] = author.split('@');
      const output = `${tempDir}/${authorName}-${month}-${year}.txt`;
      settings.repos.forEach(async repo => {
        // Git report
        logger(`Searching commits of ${author} in ${repo}…`);
        let repoDir = `${tempDir}/${repo.replace('/','-')}`
        await execa.shell(
          `git \
          --git-dir=${repoDir}/.git \
          --work-tree=${repoDir} \
          log \
          -c \
          --no-merges \
          --all \
          --author=${author} \
          --date=short \
          --since="${year}-${month}-01 00:00" \
          --until="${year}-${month}-31 23:59" \
          >> ${output}`);
      });
      // Send mail
      if (settings.targetEmail) {
        try {
          await mail(settings.targetEmail, `Git report ${authorName} ${month} ${year}`, [{ path: output }]);
          logger('Success email sent to ' + settings.targetEmail);
        } catch (error) {
          logger('Error during sending email ' + error);
        }
      }
      fs.unlinkSync(output);
    };
  };
};

/*
 * Check cookie
 */
function checkCookie (value) {
  const [hash, timestamp] = value.split('-');
  const validCookie = `${sha256(admin.login + admin.password + admin.secret + timestamp)}-${timestamp}`;

  return value === validCookie;
};

/*
 * Reports for all for previous month
 */
async function reportsForAll () {
  const settings = await getSettings();
  const date = new Date();
  let month = date.getMonth() === 0 ? 12 : date.getMonth(); //previous month
  month = ('0' + month).slice(-2);
  const year = month === 12 ? date.getFullYear() - 1 : date.getFullYear();

  generateReports(Object.values(settings.authors), [{ month, year }]);
};

/*
 * Reports for authors for specific date range
 */
async function reportsForRange (author, fromDate, toDate) {
  const settings = await getSettings();
  const dateRegExp = /^(\d{4})-(\d{1,2})$/;
  const dates = [];
  const [matchFrom, fromYear, fromMonth] = fromDate.match(dateRegExp);
  const [matchTo, toYear, toMonth] = toDate.match(dateRegExp);

  if ((matchFrom && matchTo) && ((+fromYear < +toYear) || ((+fromYear === +toYear) && (+fromMonth <= +toMonth)))) {
    for (let year = +fromYear; year <= +toYear; year++) {
      const start = +fromYear === +year ? +fromMonth : 1;
      const stop = +toYear === +year ? +toMonth : 12;
      for (let month = start; month <= stop; month++) {
        dates.push({ year, month: ('0' + month).slice(-2) });
      }
    }

    generateReports([settings.authors[author]], dates);
  } else {
    logger('Wrong date range');
  }
};

module.exports = {
  reportsForAll,
  reportsForRange,
  logger,
  runSchedule,
  cancelSchedule,
  checkCookie
};
