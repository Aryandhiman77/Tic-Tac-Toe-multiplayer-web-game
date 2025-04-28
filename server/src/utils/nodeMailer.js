const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'elody.lebsack47@ethereal.email',
        pass: 'Gpk5xtsb6sYUTyeHRF'
    }
});
  module.exports = async function mailSender(from,to,subject,body) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Tic Tac Toe 👻" <AryanDhiman@ethereal.email>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers
      subject: "Hello ✔", 
      html: "<b>Hello world?</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }
  