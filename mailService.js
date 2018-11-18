'use strict';
const nodemailer = require('nodemailer');

function sendMail (targetMail, subject, attachments) {
  const transport = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
  });

  return transport.sendMail({
    from:    'Tributum',
    to:      targetMail,
    subject,
    attachments,
    text:    ''
  });
}

module.exports = sendMail;
