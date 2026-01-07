"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const http_1 = require("../constants/http");
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError_1.AppError(message, http_1.HTTP_STATUS.BAD_REQUEST);
};
const handleDuplicateFieldsDB = (err) => {
    // Extract value using regex (matches content between quotes)
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError_1.AppError(message, http_1.HTTP_STATUS.BAD_REQUEST);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError_1.AppError(message, http_1.HTTP_STATUS.BAD_REQUEST);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        // Programming or other unknown error: don't leak error details
        console.error("ERROR 💥", err);
        res.status(http_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || http_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message; // Explicitly copy message
        // MongoDB Errors
        if (error.kind === "ObjectId" || error.name === "CastError")
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError")
            error = new AppError_1.AppError("Invalid token. Please log in again!", http_1.HTTP_STATUS.UNAUTHORIZED);
        if (error.name === "TokenExpiredError")
            error = new AppError_1.AppError("Your token has expired! Please log in again.", http_1.HTTP_STATUS.UNAUTHORIZED);
        sendErrorProd(error, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
