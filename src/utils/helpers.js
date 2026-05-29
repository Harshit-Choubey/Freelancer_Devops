const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateOTP,
  generateResetToken,
};
