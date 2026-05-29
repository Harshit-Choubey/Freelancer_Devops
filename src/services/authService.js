const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken, generateOTP } = require('../utils/helpers');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const emailService = require('./emailService');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class AuthService {

  async register(userData) {
    const { email, password, firstName, lastName, role, skills } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('User already exists with this email');
    }

    const hashedPassword = await hashPassword(password);
    const user = await userRepository.create({
      email, password: hashedPassword,
      firstName, lastName, role,
      skills: skills || [],
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTPToken.create({ data: { userId: user.id, otp, expiresAt } });

    try {
      await emailService.sendVerificationOTP(email, otp, firstName);
      logger.auth('Verification email sent', { userId: user.id, email });
    } catch (emailError) {
      logger.sysError('Failed to send verification email', emailError);
      // Dev-only fallback: log OTP to console for testing
      if (process.env.NODE_ENV === 'development') {
        logger.auth(`[DEV] Fallback OTP for ${email}: ${otp}`);
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyEmail(email, otp) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        otpTokens: {
          where: { otp, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || user.otpTokens.length === 0) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    await userRepository.update(user.id, { isVerified: true });
    await prisma.oTPToken.delete({ where: { id: user.otpTokens[0].id } });

    logger.auth('Email verified', { userId: user.id, email });
    return true;
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) throw new UnauthorizedError('Invalid email or password');

    if (!user.isVerified) throw new UnauthorizedError('Please verify your email first');

    const token = generateToken({ userId: user.id });
    const { password: _, ...userWithoutPassword } = user;

    logger.auth('User login successful', { userId: user.id, role: user.role });
    return { user: userWithoutPassword, token };
  }
}

module.exports = new AuthService();
