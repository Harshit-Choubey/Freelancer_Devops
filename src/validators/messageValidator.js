const Joi = require('joi');

const messageValidator = {
  sendMessage: Joi.object({
    jobId: Joi.string().required(), // Ideally object id validation, but keeping simple
    content: Joi.string().min(1).max(2000).required(),
  }),
};

module.exports = messageValidator;
