// MODULES
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const Path = require('path');

// This class is going to be used when sending emails.
// It allows the developer to create custom HTML emails, but also convert them to text, if needeed.
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Thiago Diniz <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return new nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a PUG template.
    template += '.pug';
    const html = pug.renderFile(
      Path.join(__dirname, '/../views/emails', template),
      { firstName: this.firstName, url: this.url, subject }
    );

    // 2) Define the email options.
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create the transport.
    // 4) Send the email.
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
