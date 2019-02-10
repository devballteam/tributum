const cwd = process.cwd();

module.exports = () => {
  const date = new Date();
  const month = date.getMonth() === 0 ? 12 : date.getMonth(); //previous month
  const year = month === 12 ? date.getFullYear() - 1 : date.getFullYear();

  return { month, year };
}
