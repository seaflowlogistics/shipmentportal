import { emailConfig, appConfig } from '../config/auth';

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

try {
  if (emailConfig.smtp.host && emailConfig.smtp.auth.user && emailConfig.smtp.auth.pass) {
    transporter = nodemailer.createTransport({
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure,
      auth: {
        user: emailConfig.smtp.auth.user,
        pass: emailConfig.smtp.auth.pass,
      },
    });
    console.log(`✅ Email transporter initialized`);
    console.log(`   Host: ${emailConfig.smtp.host}:${emailConfig.smtp.port}`);
  } else {
    console.warn('⚠️  Email configuration missing - check .env file');
  }
} catch (error) {
  console.error('❌ Failed to initialize email transporter:', error);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!transporter) {
    console.warn('Email not sent - transporter not initialized');
    return;
  }

  try {
    await transporter.sendMail({
      from: `${emailConfig.fromName} <${emailConfig.from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`✉️  Email sent to ${options.to} - Subject: ${options.subject}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (
  email: string,
  username: string,
  temporaryPassword: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 30px; }
        .credentials { background-color: white; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Shipment Portal</h1>
        </div>
        <div class="content">
          <h2>Hello ${username},</h2>
          <p>Your account has been created successfully. You can now access the Shipment Portal.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          </div>
          
          <p><strong>Important:</strong> You will be required to change your password upon first login for security reasons.</p>
          
          <a href="${appConfig.frontendUrl}/login" class="button" style="color: #ffffff !important;">Login to Portal</a>
          
          <p>If you have any questions, please contact your administrator.</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Shipment Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Shipment Portal - Your Account Details',
    html,
    text: `Welcome to Shipment Portal!\n\nYour login credentials:\nUsername: ${username}\nTemporary Password: ${temporaryPassword}\n\nPlease change your password upon first login.\n\nLogin at: ${appConfig.frontendUrl}/login`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  username: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${appConfig.frontendUrl}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 30px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .warning { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${username},</h2>
          <p>We received a request to reset your password for your Shipment Portal account.</p>
          
          <a href="${resetUrl}" class="button" style="color: #ffffff !important;">Reset Password</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
          
          <div class="warning">
            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password will remain unchanged until you create a new one</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Shipment Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request - Shipment Portal',
    html,
    text: `Password Reset Request\n\nHello ${username},\n\nWe received a request to reset your password.\n\nReset your password here: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
  });
};
