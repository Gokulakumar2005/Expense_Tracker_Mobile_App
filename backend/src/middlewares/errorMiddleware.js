function errorHandler(err, req, res, next) {
  if (process.env.DEBUG === 'True' || process.env.DEBUG === 'true') {
    console.error('Error:', err.message);
  }

  if (err.isValidation) {
    return res.status(400).json(err.errors);
  }

  if (err.code === '23505') {
    return res.status(400).json({ detail: 'A record with this data already exists.' });
  }

  if (err.code === '23514') {
    return res.status(400).json({ detail: 'Invalid value provided.' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ detail: 'Referenced record does not exist.' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ detail: 'Invalid or expired token.' });
  }

  return res.status(err.status || 500).json({
    detail: err.message || 'Internal server error.',
  });
}

function validationError(errors) {
  const err = new Error('Validation error');
  err.isValidation = true;
  err.errors = errors;
  err.status = 400;
  return err;
}

function notFoundHandler(req, res) {
  res.status(404).json({ detail: 'Not found.' });
}

export { errorHandler, validationError, notFoundHandler };
export default { errorHandler, validationError, notFoundHandler };
