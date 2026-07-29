import { Resend } from 'resend';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const resend = new Resend(env.RESEND_API_KEY);

export interface ContactNotificationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  message: string;
  serviceName?: string | null;
}

const sendContactNotification = async (
  data: ContactNotificationData
): Promise<void> => {
  try {
    await resend.emails.send({
      from: env.MAIL_FROM,
      to: env.MAIL_TO,
      replyTo: data.email,
      subject: `New Enquiry: ${data.serviceName ?? 'General'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone ?? 'Not provided'}</p>
        <p><strong>Service:</strong> ${data.serviceName ?? 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br />')}</p>
      `,
    });
  } catch (error) {
    // Notification failure must never fail the contact submission itself.
    // The enquiry is already saved; log and move on.
    logger.error({ err: error }, 'Failed to send contact notification email.');
  }
};

export const emailService = {
  sendContactNotification,
};