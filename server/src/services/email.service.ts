import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
    } = process.env;

    // Check if email is configured
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('Email service not configured. Email notifications will be disabled.');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: SMTP_SECURE === 'true',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured. Skipping email:', options.subject);
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendNewShipmentNotification(shipment: any, managerEmails: string[]) {
    const subject = `New Shipment Created - ${shipment.shipment_id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; width: 150px; color: #6b7280; }
          .detail-value { flex: 1; color: #111827; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Shipment Awaiting Review</h1>
          </div>
          <div class="content">
            <p>A new shipment has been created and requires your review and approval.</p>
            
            <div class="details">
              <h2 style="margin-top: 0; color: #111827;">Shipment Details</h2>
              <div class="detail-row">
                <div class="detail-label">Shipment ID:</div>
                <div class="detail-value"><strong>${shipment.shipment_id}</strong></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">From:</div>
                <div class="detail-value">${shipment.exporter_name}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">To:</div>
                <div class="detail-value">${shipment.receiver_name}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Mode:</div>
                <div class="detail-value" style="text-transform: capitalize;">${shipment.mode_of_transport}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Value:</div>
                <div class="detail-value">${shipment.currency} ${shipment.value.toFixed(2)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Pickup Date:</div>
                <div class="detail-value">${new Date(shipment.pickup_date).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/shipment/${shipment.id}" class="button" style="color: #ffffff !important;">
                Review Shipment
              </a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification from Shipment Portal.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: managerEmails,
      subject,
      html,
    });
  }

  async sendApprovalNotification(shipment: any, agentEmail: string) {
    const subject = `Shipment Approved - ${shipment.shipment_id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .success-badge { background-color: #D1FAE5; color: #065F46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Shipment Approved</h1>
          </div>
          <div class="content">
            <p>Great news! Your shipment has been approved and is ready to proceed.</p>
            
            <div class="details">
              <h2 style="margin-top: 0; color: #111827;">Shipment Information</h2>
              <p><strong>Shipment ID:</strong> ${shipment.shipment_id}</p>
              <p><strong>Status:</strong> <span class="success-badge">APPROVED</span></p>
              <p><strong>From:</strong> ${shipment.exporter_name}</p>
              <p><strong>To:</strong> ${shipment.receiver_name}</p>
              <p><strong>Pickup Date:</strong> ${new Date(shipment.pickup_date).toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/shipment/${shipment.id}" class="button" style="color: #ffffff !important;">
                View Shipment Details
              </a>
            </div>
            
            <p style="margin-top: 20px; color: #6b7280;">
              <strong>Next Steps:</strong> Your shipment is now approved and ready for processing. 
              You can track its progress in the shipment portal.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Shipment Portal.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: agentEmail,
      subject,
      html,
    });
  }

  async sendRejectionNotification(shipment: any, agentEmail: string, reason: string) {
    const subject = `Shipment Rejected - ${shipment.shipment_id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .danger-badge { background-color: #FEE2E2; color: #991B1B; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .reason-box { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Shipment Rejected</h1>
          </div>
          <div class="content">
            <p>Your shipment has been reviewed and rejected. Please review the reason below and make necessary corrections.</p>
            
            <div class="details">
              <h2 style="margin-top: 0; color: #111827;">Shipment Information</h2>
              <p><strong>Shipment ID:</strong> ${shipment.shipment_id}</p>
              <p><strong>Status:</strong> <span class="danger-badge">REJECTED</span></p>
              <p><strong>From:</strong> ${shipment.exporter_name}</p>
              <p><strong>To:</strong> ${shipment.receiver_name}</p>
            </div>
            
            <div class="reason-box">
              <h3 style="margin-top: 0; color: #991B1B;">Rejection Reason:</h3>
              <p style="margin-bottom: 0;">${reason}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/shipment/${shipment.id}" class="button" style="color: #ffffff !important;">
                View Shipment Details
              </a>
            </div>
            
            <p style="margin-top: 20px; color: #6b7280;">
              <strong>Next Steps:</strong> Please review the rejection reason and create a new shipment 
              with the necessary corrections.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Shipment Portal.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: agentEmail,
      subject,
      html,
    });
  }

  async sendChangesRequestedNotification(shipment: any, agentEmail: string, message: string) {
    const subject = `Changes Requested - ${shipment.shipment_id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .warning-badge { background-color: #FEF3C7; color: #92400E; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .message-box { background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Changes Requested</h1>
          </div>
          <div class="content">
            <p>The reviewer has requested changes to your shipment. Please review the message below and update your shipment accordingly.</p>
            
            <div class="details">
              <h2 style="margin-top: 0; color: #111827;">Shipment Information</h2>
              <p><strong>Shipment ID:</strong> ${shipment.shipment_id}</p>
              <p><strong>Status:</strong> <span class="warning-badge">CHANGES REQUESTED</span></p>
              <p><strong>From:</strong> ${shipment.exporter_name}</p>
              <p><strong>To:</strong> ${shipment.receiver_name}</p>
            </div>
            
            <div class="message-box">
              <h3 style="margin-top: 0; color: #92400E;">Requested Changes:</h3>
              <p style="margin-bottom: 0;">${message}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/edit-shipment/${shipment.id}" class="button" style="color: #ffffff !important;">
                Edit Shipment
              </a>
            </div>
            
            <p style="margin-top: 20px; color: #6b7280;">
              <strong>Next Steps:</strong> Please make the requested changes and resubmit your shipment for review.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Shipment Portal.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: agentEmail,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, userName: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const subject = 'Password Reset Request - Shipment Portal';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 4px; color: #991B1B; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your Shipment Portal account.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button" style="color: #ffffff !important;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <p style="margin: 0;"><strong>Security Notice:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated email from Shipment Portal.</p>
            <p>If you have any questions, please contact your administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
