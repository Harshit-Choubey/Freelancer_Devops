const { AppError } = require('../utils/errors');
const env = require('../config/env');
const logger = require('../utils/logger');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;

    if (error.code === 'P2002') error = new AppError('Duplicate field value entered', 400);
    if (error.code === 'P2025') error = new AppError('Record not found', 404);
    if (error.name === 'ValidationError') error = new AppError('Validation Error', 400);
    if (error.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again!', 401);
    if (error.name === 'TokenExpiredError') error = new AppError('Your token has expired! Please log in again.', 401);

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
