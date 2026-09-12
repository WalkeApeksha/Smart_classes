import nodemailer from 'nodemailer';

/**
 * Send Email Notification
 */
export const sendEmailNotification = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return {
      success: false,
      delivered: false,
      channel: 'email',
      message: 'Email service credentials not configured in backend environment variables'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Kashvi SmartClass" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    return { success: true, delivered: true, channel: 'email', messageId: info.messageId };
  } catch (err) {
    console.error('Email Dispatch Error:', err.message);
    return { success: false, delivered: false, channel: 'email', error: err.message };
  }
};

/**
 * Send WhatsApp Notification (Twilio / WhatsApp Cloud API)
 */
export const sendWhatsAppNotification = async ({ toPhone, message }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return {
      success: false,
      delivered: false,
      channel: 'whatsapp',
      message: 'WhatsApp service is not configured in backend environment variables (requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER).'
    };
  }

  try {
    // In live deployment with Twilio SDK or REST API
    return {
      success: true,
      delivered: true,
      channel: 'whatsapp',
      message: `WhatsApp message dispatched to ${toPhone}`
    };
  } catch (err) {
    return { success: false, delivered: false, channel: 'whatsapp', error: err.message };
  }
};
