const fs = require('fs');
const logFile = './logs';

module.exports = (message) => {
  const date = new Date();
  const dateFormat = {
    year:   'numeric',
    month:  'numeric',
    day:    'numeric',
    hour:   'numeric',
    minute: 'numeric',
    second: 'numeric' 
  };
  const output = `[${date.toLocaleDateString('pl', dateFormat)}] - ${message}`;
  console.log(output);
  // TODO log file rotation
  fs.appendFileSync(logFile, output + '\n');
  /*
    - broadcast to ws
  */
}
