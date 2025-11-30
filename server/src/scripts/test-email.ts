import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'Not Set');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true, // Enable debug output
        logger: true  // Log to console
    });

    try {
        // Verify connection configuration
        console.log('\nVerifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection verified successfully!');

        // Send test email
        console.log('\nSending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test Email from Shipment Portal Debugger',
            text: 'If you receive this, the email configuration is working correctly.',
            html: '<b>If you receive this, the email configuration is working correctly.</b>'
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error('\n❌ Email Test Failed:');
        console.error(error);
    }
}

testEmail();
