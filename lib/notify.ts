import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';
import nodemailer from 'nodemailer';

// Email transporter setup (reuse from auth)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface NotifyOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  emailTemplate?: 'new-message' | 'new-review' | 'review-reply';
}

/**
 * Central notification dispatcher
 * Creates in-app notification and optionally sends email
 */
export async function notify(options: NotifyOptions): Promise<void> {
  const { userId, type, title, body, data, sendEmail = false, emailTemplate } = options;

  try {
    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
      },
    });

    // Send email if requested
    if (sendEmail && emailTemplate) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        await sendNotificationEmail({
          to: user.email,
          name: user.name || 'User',
          template: emailTemplate,
          data: data || {},
        });
      }
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't throw - notifications should not break the main flow
  }
}

interface EmailOptions {
  to: string;
  name: string;
  template: 'new-message' | 'new-review' | 'review-reply';
  data: Record<string, any>;
}

async function sendNotificationEmail(options: EmailOptions): Promise<void> {
  const { to, name, template, data } = options;

  let subject: string;
  let html: string;

  switch (template) {
    case 'new-message':
      subject = 'New Message on CookFort';
      html = getNewMessageEmailHtml(name, data);
      break;
    case 'new-review':
      subject = 'New Review Received';
      html = getNewReviewEmailHtml(name, data);
      break;
    case 'review-reply':
      subject = 'Chef Replied to Your Review';
      html = getReviewReplyEmailHtml(name, data);
      break;
    default:
      return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Email template generators
function getNewMessageEmailHtml(name: string, data: Record<string, any>): string {
  const { senderName, conversationId, bookingId } = data;
  const link = bookingId
    ? `${process.env.NEXTAUTH_URL}/bookings/${bookingId}`
    : `${process.env.NEXTAUTH_URL}/messages/${conversationId}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #ff8b35 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Message</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>You have a new message from <strong>${senderName}</strong> on CookFort.</p>
            <p style="text-align: center;">
              <a href="${link}" class="button">View Message</a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Click the button above to read and reply to the message.
            </p>
          </div>
          <div class="footer">
            <p>CookFort &copy; ${new Date().getFullYear()}</p>
            <p>You're receiving this because you have notifications enabled.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getNewReviewEmailHtml(name: string, data: Record<string, any>): string {
  const { rating, reviewerName, bookingId } = data;
  const link = `${process.env.NEXTAUTH_URL}/dashboard/chef/reviews`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .stars { font-size: 24px; color: #ffc107; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Review Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! You received a new review from <strong>${reviewerName}</strong>.</p>
            <div style="text-align: center; margin: 20px 0;">
              <div class="stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
              <p style="font-size: 18px; margin: 5px 0;">${rating} out of 5 stars</p>
            </div>
            <p style="text-align: center;">
              <a href="${link}" class="button">View Review</a>
            </p>
            <p style="color: #666; font-size: 14px;">
              You can reply to this review from your dashboard.
            </p>
          </div>
          <div class="footer">
            <p>CookFort &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getReviewReplyEmailHtml(name: string, data: Record<string, any>): string {
  const { chefName, reviewId } = data;
  const link = `${process.env.NEXTAUTH_URL}/dashboard/user/reviews`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2196F3 0%, #42A5F5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chef Replied to Your Review</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p><strong>${chefName}</strong> has replied to your review on CookFort.</p>
            <p style="text-align: center;">
              <a href="${link}" class="button">View Reply</a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Click the button above to see what the chef said.
            </p>
          </div>
          <div class="footer">
            <p>CookFort &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Batch notify multiple users
export async function notifyMultiple(
  notifications: Array<Omit<NotifyOptions, 'sendEmail' | 'emailTemplate'>>
): Promise<void> {
  await Promise.allSettled(
    notifications.map(notification => notify({ ...notification, sendEmail: false }))
  );
}
