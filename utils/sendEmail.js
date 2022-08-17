// MODULES
const nodemailer = require('nodemailer');

module.exports = async (to, message, subject) => {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  await transporter.sendMail({
    from: `${testAccount.user}`, // sender address
    to: `${to}`, // list of receivers
    subject, // Subject line
    text: message, // plain text body
  });
};
