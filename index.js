const express = require('express');
const app = express();
const port = 3000;
const router = require('./router.js');
const scheduler = require('./scheduler.js');
const mail = require('./mailService.js');
const iterator = require('./iterator.js');

router(app);
//every first day of month
scheduler.run('* * * 1 * *', () => {
  iterator();
});

app.listen(port, () => console.log(`App started on port ${port}!`));
