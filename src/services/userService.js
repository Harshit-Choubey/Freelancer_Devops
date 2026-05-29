const userRepository = require('../repositories/userRepository');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { hashPassword, comparePassword } = require('../utils/helpers');
const logger = require('../utils/logger');

class UserService {
  // ─── Update Profile ────────────────────────────────────────────────────────
  async updateProfile(userId, profileData) {
    const { firstName, lastName, bio, skills, phone } = profileData;

    const user = await userRepository.updateProfile(userId, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }),
      ...(phone !== undefined && { phone }),
    });

    logger.auth('Profile updated', { userId });
    return user;
  }

  // ─── Change Password ──────────────────────────────────────────────────────
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) throw new BadRequestError('Current password is incorrect');

    const hashedNewPassword = await hashPassword(newPassword);
    await userRepository.update(userId, { password: hashedNewPassword });

    logger.auth('Password changed', { userId });
    return true;
  }

  // ─── Get Freelancers ──────────────────────────────────────────────────────
  async getFreelancers(query) {
    const { page = 1, limit = 10, skills, search } = query;
    const skip = (page - 1) * limit;

    return await userRepository.findFreelancers({
      skip: parseInt(skip),
      take: parseInt(limit),
      skills: skills ? skills.split(',') : undefined,
      search,
    });
  }

  // ─── Get Freelancer By ID ─────────────────────────────────────────────────
  async getFreelancerById(id) {
    const freelancer = await userRepository.findFreelancerById(id);
    if (!freelancer) throw new NotFoundError('Freelancer not found');

    const completedProjects = freelancer.applications.filter(
      (app) => app.job.status === 'COMPLETED'
    ).length;

    const totalEarnings = freelancer.applications
      .filter((app) => app.job.status === 'COMPLETED')
      .reduce((sum, app) => sum + app.bidAmount, 0);

    return {
      ...freelancer,
      stats: {
        completedProjects,
        totalEarnings,
        totalApplications: freelancer.applications.length,
      },
    };
  }

  // ─── Upload Profile Picture ───────────────────────────────────────────────
  async uploadProfilePicture(userId, file) {
    if (!file) throw new BadRequestError('No file uploaded');

    const profilePicture = `/uploads/${file.filename}`;
    const user = await userRepository.update(userId, { profilePicture });

    logger.upload('Profile picture updated', { userId, filename: file.filename });
    return user;
  }

  // ─── Dashboard Stats ──────────────────────────────────────────────────────
  async getDashboardStats(userId, userRole) {
    return await userRepository.getDashboardStats(userId, userRole);
  }
}

module.exports = new UserService();
