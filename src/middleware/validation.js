const Joi = require('joi');
const { AppError } = require('../utils/helpers');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details[0].message;
      return next(new AppError(message, 400));
    }
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  role: Joi.string().valid('CLIENT', 'FREELANCER').required(),
  skills: Joi.array().items(Joi.string()).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const jobSchema = Joi.object({
  title: Joi.string().min(10).max(100).required(),
  description: Joi.string().min(50).required(),
  budget: Joi.number().positive().required(),
  requiredSkills: Joi.array().items(Joi.string()).min(1).required(),
  category: Joi.string().required(),
});

const applicationSchema = Joi.object({
  coverLetter: Joi.string().min(100).required(),
  bidAmount: Joi.number().positive().required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  jobSchema,
  applicationSchema,
};
