import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  from?: string;
}

let transporter: Transporter | null = null;

function createTransporter(): Transporter {
  if (transporter) return transporter;
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw new Error('Email configuration is incomplete.');
  }

  const secure = port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error);
    } else {
      console.log('Email transporter is configured correctly.');
    }
  });

  return transporter;
}

export const sendEmail = async (
  options: EmailOptions
): Promise<nodemailer.SentMessageInfo> => {
  // 1) Create transporter
  const transport = createTransporter();

  // 2) Define email options (like from, to, subject, email content)
  const mailOpts: EmailOptions = {
    from: process.env.EMAIL_FROM || 'Course Management',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  // 3) Send email
  try {
    const info = await transport.sendMail(mailOpts);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(
      `Email sending failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
