const { BadRequestError } = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details[0].message;
      return next(new BadRequestError(message));
    }
    next();
  };
};

module.exports = { validate };
