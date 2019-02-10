const cwd = process.cwd();
const sha256 = require("crypto-js/sha256");

module.exports = (value) => {
  const [hash, timestamp] = value.split('-');
  const validCookie = `${sha256(admin.login + admin.password + admin.secret + timestamp)}-${timestamp}`;

  return value === validCookie;
}
