const schedule = require('node-schedule');
let scheduledTask;

module.exports = {
  run: (pattern, cb) => {
    scheduledTask = schedule.scheduleJob(pattern, () => {
      console.log('Scheduler executes task');
      cb && cb();
    });
  },
  cancel: () => {
    scheduledTask.cancel();
    scheduledTask = undefined;
  }
};
