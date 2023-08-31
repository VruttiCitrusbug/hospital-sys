const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SEND_EMAIL_USER,
    pass: process.env.SEND_EMAIL_USER_PASSWORD,
  },
});


const sendwelcome = async (email) => { 
    await transporter.sendMail({
    from: process.env.SEND_EMAIL_USER,
    to: email,
    subject: "Welcome", 
    text: `Thank you for joining the system.`
    
  }).then((res)=>{
    console.log("SENT...",res)
  });
}
module.exports = sendwelcome