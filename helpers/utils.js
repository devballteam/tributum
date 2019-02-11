const cwd = process.cwd();
const iterator = require(`${cwd}/helpers/iterator.js`);
const settings = require(`${cwd}/settings.json`);

function previousMonth () {
  const date = new Date();
  let month = date.getMonth() === 0 ? 12 : date.getMonth(); //previous month
  month = ('0' + month).slice(-2);
  const year = month === 12 ? date.getFullYear() - 1 : date.getFullYear();

  return { month, year };
}
const utlis = {
  getAndSendAllReports: () => {
    iterator(Object.values(settings.authors), [previousMonth()]);
  },
  getAndSendReportsForAuthor: (author, fromDate, toDate) => {
    //convert fromDate toDate to array with dates
    //iterator([settings.authors[author]], dates);
  }
}
module.exports = utlis;
