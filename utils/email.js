// MODULES
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const Path = require('path');

// O primeiro passo é criar a classe Email.
module.exports = class Email {
  // No constructor iremos passar dois parâmetros fundamentais para esse exemplo: O user e a url.
  // O primeiro parâmetro dará acesso a informações como o email e o nome do cliente. Já o segundo,
  // permitirá que uma ação seja transmitida para o cliente.
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Thiago Diniz <${process.env.EMAIL_FROM}>`;
  }

  // O Nodemailer precisa de um transport, que é objeto que permitirá o envio de emails mais diretamente.
  // Para isso, ele recebe dados como host (gmail, outlook, entre outros), porta (para comunicar com o serviço.
  // E os dados de autenticação, como senha e email/username.
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

  // O método send é responsável por permitir o envio de novos emails, onde ele irá receber
  // quais são é o template e o tópico do email.
  async send(template, subject) {
    // Os templates são todos feitos no PUG, convertidos para HTML.
    template += '.pug';
    const html = pug.renderFile(
      Path.join(__dirname, '/../views/emails', template),
      { firstName: this.firstName, url: this.url, subject }
    );

    // Após obtermos o template em HTML, temos de configurar as opções de envio do email.
    // Esse são os dados como remetente, destinatário, tópico, o html do email e o text
    // dele. No texto estamos usando um pacote chamado htmlToText, que converte o nosso
    // template para um formato de plain text. O que é necessário já que muitos emails
    // não conseguem ler o html, e optam pelo texto.
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // A etapa final é criar um transporte, e enviar o email com as opções desejadas.
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
