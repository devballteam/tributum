const cwd = process.cwd();
const fs = require('fs');
const websocekt = require(`${cwd}/services/websocket.js`);
const logFile = `${cwd}/logs`;

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
  let output = `[${date.toLocaleDateString('pl', dateFormat)}] - ${message}`;

  console.log(output);
  output += '\n';
  // TODO log file rotation
  fs.appendFileSync(logFile, output);
  websocekt.sendToAll({ data: output });
}
