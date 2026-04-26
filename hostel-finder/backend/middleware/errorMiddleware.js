// middleware/errorMiddleware.js
// Centralised error handler. Express calls this when next(error) is invoked
// from any route or when an unhandled error is thrown.
// Must have 4 parameters (err, req, res, next) — Express detects this signature.

const errorHandler = (err, req, res, next) => {
  // Use the error's own status code or default to 500
  let statusCode = err.statusCode || res.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose: Cast Error (invalid ObjectId format) ──────────────────────────
  // e.g. /api/listings/not-a-valid-id
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found. Invalid ID: ${err.value}`;
  }

  // ── Mongoose: Duplicate Key Error ──────────────────────────────────────────
  // e.g. registering with an email already in the DB
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── Mongoose: Validation Error ─────────────────────────────────────────────
  // Collects all validation messages into a single string
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // ── JWT Errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development — never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// ── 404 handler — mount BEFORE errorHandler in server.js ────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
