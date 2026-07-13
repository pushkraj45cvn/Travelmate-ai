const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter;
let skipEmails = false;
let verificationDone = false;

/**
 * Check if SMTP credentials are real (not placeholders).
 */
const hasRealCredentials = () => {
  return !!(
    smtpHost &&
    smtpPort &&
    smtpUser &&
    smtpPass &&
    !smtpUser.includes('your-email') &&
    !smtpPass.includes('your-app-password') &&
    !smtpPass.includes('your-password')
  );
};

/**
 * Create or update the transporter based on credential availability.
 */
const createTransporter = () => {
  if (hasRealCredentials()) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    return true;
  } else {
    skipEmails = true;
    transporter = {
      sendMail: async () => {
        return Promise.resolve();
      },
    };
    return false;
  }
};

// Initialize transporter on module load
createTransporter();

if (skipEmails) {
  console.warn('SMTP is not configured or uses placeholder credentials. Email sending will be skipped.'.yellow);
}

/**
 * Test the SMTP connection by verifying credentials with the mail server.
 * Call this during startup to catch SMTP auth issues early.
 */
const testConnection = async () => {
  if (skipEmails || verificationDone) return true;

  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully.'.green);
    verificationDone = true;
    return true;
  } catch (error) {
    console.warn(`SMTP verification failed: ${error.message}`.yellow);
    console.warn('Email sending will be disabled. The server will continue without email functionality.'.yellow);

    // Fall back to dummy transporter
    skipEmails = true;
    transporter = {
      sendMail: async () => {
        return Promise.resolve();
      },
    };
    verificationDone = true;
    return false;
  }
};

const sendEmail = async (options) => {
  if (skipEmails) {
    console.warn(`[SMTP Skipped] ${options.subject} → ${options.email}`.gray);
    return;
  }

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Email sent: ${options.subject} → ${options.email}`.green);
  } catch (error) {
    console.warn(`Failed to send email (${options.subject} → ${options.email}): ${error.message}`.yellow);
    // Don't throw — email failures should never crash the request
  }
};

module.exports = { sendEmail, testConnection };
