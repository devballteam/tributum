const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const iterator = require('./iterator.js');

module.exports = (app) => {
  app.get('/', async (req, res) => {
    const users = (req.query.author || '').split(',');
    const files = await iterator(users, req.query.month, req.query.year);
    const file = `${process.cwd()}/${files[0]}`;

    console.log('Done', file);
    res.download(file);
  });
};
