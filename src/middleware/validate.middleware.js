const { error } = require('../utils/apiResponse');

/**
 * Joi schema validation middleware
 * Usage: validate(schema) — validates req.body
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error: joiError } = schema.validate(req.body, { abortEarly: false });
    if (joiError) {
      const errors = joiError.details.map((d) => d.message);
      return error(res, 'Validation failed', 400, errors);
    }
    next();
  };
};

module.exports = { validate };
