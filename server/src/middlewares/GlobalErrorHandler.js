const GlobalErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: err.success, // always false
        message: err.message,
        errors: err.errors,
        data: err.data,
      });
    }
  
    // fallback for unknown errors
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  };
  module.exports = GlobalErrorHandler;