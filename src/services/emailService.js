const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Try multiple Gmail configurations
    const gmailConfig = {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    // Alternative configuration for Gmail
    const alternativeConfig = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    // Use primary config, fallback available
    this.transporter = nodemailer.createTransport(gmailConfig);
  }

  async sendVerificationOTP(email, otp, name) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Freelance Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with our Freelance Marketplace!</p>
          <p>Your verification code is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetLink(email, resetToken, name) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - Freelance Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="color: #007bff;">Reset Password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Test email function
  async testEmailConnection() {
    try {
      console.log('Testing email connection...');
      console.log('Email User:', process.env.EMAIL_USER);
      console.log('Email Pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set');
      
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.log('❌ Email service error details:');
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error response:', error.response);
      return false;
    }
  }
}

module.exports = new EmailService();
