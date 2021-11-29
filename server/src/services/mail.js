const nodemailer = require('nodemailer');

exports.mail = async ({email,subject,htmlBody})=>{    
  console.log('emai',email);
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "c8b492cbf58f8f",
          pass: "332662353bb1af"
        }
      });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Faisal" <faisal78676@gmail.com>', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line      
      html: htmlBody, // html body
    });

    return info
}