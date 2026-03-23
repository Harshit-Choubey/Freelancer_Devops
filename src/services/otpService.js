const { PrismaClient } = require('@prisma/client');
const { generateOTP } = require('../utils/helpers');
const emailService = require('./emailService');

const prisma = new PrismaClient();

class OTPService {
  async generateAndSendOTP(userId, email, firstName) {
    try {
      // Delete any existing OTPs for this user
      await prisma.oTPToken.deleteMany({
        where: { userId },
      });

      // Generate new OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await prisma.oTPToken.create({
        data: {
          userId,
          otp,
          expiresAt,
        },
      });

      // Send OTP via email
      await emailService.sendVerificationOTP(email, otp, firstName);

      return otp;
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(userId, otp) {
    try {
      const otpToken = await prisma.oTPToken.findFirst({
        where: {
          userId,
          otp,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otpToken) {
        return false;
      }

      // Delete the used OTP
      await prisma.oTPToken.delete({
        where: { id: otpToken.id },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async resendOTP(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User is already verified');
      }

      const otp = await this.generateAndSendOTP(user.id, email, user.firstName);
      return otp;
    } catch (error) {
      throw error;
    }
  }

  async cleanupExpiredOTPs() {
    try {
      const result = await prisma.oTPToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`Cleaned up ${result.count} expired OTP tokens`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();