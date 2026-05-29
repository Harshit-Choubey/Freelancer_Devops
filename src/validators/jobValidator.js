const Joi = require('joi');

const jobValidator = {
  create: Joi.object({
    title: Joi.string().min(10).max(100).required(),
    description: Joi.string().min(50).required(),
    budget: Joi.number().positive().required(),
    requiredSkills: Joi.array().items(Joi.string()).min(1).required(),
    category: Joi.string().required(),
  }),
  update: Joi.object({
    title: Joi.string().min(10).max(100),
    description: Joi.string().min(50),
    budget: Joi.number().positive(),
    requiredSkills: Joi.array().items(Joi.string()).min(1),
    category: Joi.string(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
  }).min(1),
  apply: Joi.object({
    coverLetter: Joi.string().min(50).required(),
    bidAmount: Joi.number().positive().required(),
  }),
  updateApplicationStatus: Joi.object({
    status: Joi.string().valid('ACCEPTED', 'REJECTED', 'PENDING').required(),
  }),
};

module.exports = jobValidator;
