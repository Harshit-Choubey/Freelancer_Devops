const Joi = require('joi');

const authValidator = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    role: Joi.string().valid('CLIENT', 'FREELANCER').required(),
    skills: Joi.array().items(Joi.string()).optional(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }),
};

module.exports = authValidator;
