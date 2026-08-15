// backend/src/lib/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, // true for port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(toEmail, verifyUrl) {
  await transporter.sendMail({
    from: `"SafariConnect Kenya" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Verify your SafariConnect Kenya account',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123;">Welcome to SafariConnect Kenya</h2>
        <p>Please confirm your email address to activate your account.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #123; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Verify my email
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">Or paste this link into your browser:<br>${verifyUrl}</p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  });
}

async function sendInvoiceEmail(toEmail, { companyName, invoiceNumber, planName, amountKes, pdfBuffer }) {
  await transporter.sendMail({
    from: `"SafariConnect Kenya" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Payment received — Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123;">Payment confirmed</h2>
        <p>Hi ${companyName},</p>
        <p>Thanks for your payment. Your <strong>${planName}</strong> plan is now active on SafariConnect Kenya.</p>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #666;">Invoice number</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Amount paid</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">KES ${Number(amountKes).toLocaleString()}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 13px;">Your official receipt is attached as a PDF.</p>
      </div>
    `,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await transporter.sendMail({
    from: `"SafariConnect Kenya" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset your SafariConnect Kenya password',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123;">Reset your password</h2>
        <p>We received a request to reset the password on your SafariConnect Kenya account.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #123; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset my password
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">Or paste this link into your browser:<br>${resetUrl}</p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will not change.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendInvoiceEmail, sendPasswordResetEmail };