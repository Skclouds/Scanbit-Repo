/**
 * Input validation middleware - prevent over-posting
 * Rejects requests with unexpected fields in body
 */
export const createStrictBodyValidator = (allowedFields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') return next();

    const bodyKeys = Object.keys(req.body);
    const unexpected = bodyKeys.filter((k) => !allowedFields.includes(k));

    if (unexpected.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Unexpected fields in request',
        errorCode: 'VALIDATION_UNEXPECTED_FIELDS',
        fields: unexpected,
      });
    }
    next();
  };
};

/** Skip validation when no allowed fields specified (permissive mode) */
export const strictBody = (allowedFields) => {
  if (!Array.isArray(allowedFields) || allowedFields.length === 0) {
    return (_req, _res, next) => next();
  }
  return createStrictBodyValidator(allowedFields);
};

export default { createStrictBodyValidator, strictBody };
