import { sendEmailNotification, sendWhatsAppNotification } from '../utils/notificationService.js';
import User from '../models/User.js';

// @desc    Broadcast notification via Email and/or WhatsApp
// @route   POST /api/notifications/broadcast
export const broadcastNotification = async (req, res, next) => {
  try {
    const { channel, message, title, targetRole, targetClass, recipientEmail, recipientPhone } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Notification message is required' });
    }

    let emailResult = null;
    let whatsappResult = null;

    if (channel === 'email' || channel === 'both') {
      if (recipientEmail) {
        emailResult = await sendEmailNotification({
          to: recipientEmail,
          subject: title || 'Kashvi SmartClass Notification',
          text: message,
          html: `<div style="font-family:sans-serif; padding:16px;"><h2>${title || 'Institutional Notification'}</h2><p>${message}</p></div>`
        });
      }
    }

    if (channel === 'whatsapp' || channel === 'both') {
      whatsappResult = await sendWhatsAppNotification({
        toPhone: recipientPhone || '+919876543210',
        message: `*Kashvi SmartClass Notice*\n\n${title ? '*' + title + '*\n' : ''}${message}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification request processed',
      deliveryStatus: {
        email: emailResult,
        whatsapp: whatsappResult
      }
    });
  } catch (error) {
    next(error);
  }
};
