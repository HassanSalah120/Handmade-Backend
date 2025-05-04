const AppError = require("../utils/AppError");
module.exports = (err, req, res, nxt) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV == "development") {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV == "production") {
    let error = { ...err };
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();
    sendErrorForProd(error, res);
  }
};

const handleTokenExpiredError = () =>
  new AppError(`Your Token has expired..! Please log in again..!`, 401);

const handleJWTError = () =>
  new AppError("Invalid Token. Please log in again..!!", 401);

sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
sendErrorForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
