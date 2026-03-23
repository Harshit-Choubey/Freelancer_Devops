const { PrismaClient } = require('@prisma/client');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateOTP,
  generateResetToken,
  AppError 
} = require('../utils/helpers');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, skills } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        skills: skills || [],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        skills: true,
      },
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTPToken.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    });

    // Send verification email
    try {
      await emailService.sendVerificationOTP(email, otp, firstName);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      console.log('❌ Failed to send verification email:', emailError.message);
      // Still log OTP as fallback in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔑 Fallback OTP for ${email}: ${otp}`);
      }
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        otpTokens: {
          where: {
            otp,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user || user.otpTokens.length === 0) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Delete used OTP
    await prisma.oTPToken.delete({
      where: { id: user.otpTokens[0].id },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Please verify your email first', 401));
    }

    // Generate token
    const token = generateToken({ userId: user.id });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        skills: true,
        profilePicture: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  getProfile,
};
