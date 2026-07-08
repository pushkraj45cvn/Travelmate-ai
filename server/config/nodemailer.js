const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter;
let skipEmails = false;

if (
  smtpHost &&
  smtpPort &&
  smtpUser &&
  smtpPass &&
  !smtpUser.includes('your-email') &&
  !smtpPass.includes('your-app-password')
) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  console.warn('SMTP is not configured or uses placeholder credentials. Email sending will be skipped.');
  skipEmails = true;
  transporter = {
    sendMail: async () => {
      return Promise.resolve();
    },
  };
}

const sendEmail = async (options) => {
  if (skipEmails) {
    console.warn(`Email skipped: ${options.subject} to ${options.email}`);
    return;
  }

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(message);
};

module.exports = { sendEmail };
