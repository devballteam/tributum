const express = require('express');
const app = express();
const port = 3000;
const router = require('./router.js');
const scheduler = require('./scheduler.js');
const mail = require('./mailService.js');
const iterator = require('./iterator.js');

/*
router(app);
//every first day of month
scheduler.run('* * * 1 * *', () => {
  iterator();
  const attachments = [{ path: 'package.json' }, { path: 'README.md' }];
  mail('mark.bogatzki@gmail.com', 'TEST', attachments).then(() => console.log('success'));
});
*/

app.listen(port, () => console.log(`App started on port ${port}!`));
