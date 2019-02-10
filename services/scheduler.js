const cwd = process.cwd();
const logger = require(`${cwd}/helpers/logger`);
const schedule = require('node-schedule');
let scheduledTask;

module.exports = {
  run: (pattern, cb) => {
    logger('Scheduler is set');
    scheduledTask = schedule.scheduleJob(pattern, () => {
      logger('Scheduler executes task');
      global.schedulerStatus = 'running';
      cb && cb();
      global.schedulerStatus = 'scheduled';
    });
  },
  cancel: () => {
    logger('Scheduler is canceled');
    scheduledTask && scheduledTask.cancel();
    scheduledTask = undefined;
  }
};
