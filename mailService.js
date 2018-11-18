'use strict';
const nodemailer = require('nodemailer');
const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  host:    'smtp.gmail.com',
  port:    465,
  secure:  true, // use SSL
  auth: {
    user: 'USER',
    pass: 'PASS'
  }
});
const mailOptions={
  to:      'TEST',
  subject: 'TEST',
  text:    'TEST'
};

module.exports = () => {
  smtpTransport.sendMail(mailOptions, (error, response) => console.log('Mail sent', error, response));
};
