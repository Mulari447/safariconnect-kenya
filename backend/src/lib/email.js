const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log(`\n================ 📧 SIMULATED EMAIL NOTIFICATION ================`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`-----------------------------------------------------------------`);
      console.log(html.replace(/<[^>]*>?/gm, ''));
      console.log(`=================================================================\n`);
      return;
    }

    const port = Number(process.env.SMTP_PORT) || 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SafariConnect Kenya" <info@safariconnect.co.ke>',
      to,
      subject,
      html,
    });
    
    console.log(`[Email Sent] Successfully sent email to ${to}`);
  } catch (err) {
    console.error('[Email Error]:', err);
  }
};

module.exports = { sendEmail };