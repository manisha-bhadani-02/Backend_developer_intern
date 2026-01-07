import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/http";

const handleCastErrorDB = (err: any) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err: any) => {
    // Extract value using regex (matches content between quotes)
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleValidationErrorDB = (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const sendErrorDev = (err: any, res: Response) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err: any, res: Response) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error("ERROR 💥", err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }
};

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message; // Explicitly copy message

        // MongoDB Errors
        if (error.kind === "ObjectId" || error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError") error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = new AppError("Invalid token. Please log in again!", HTTP_STATUS.UNAUTHORIZED);
        if (error.name === "TokenExpiredError") error = new AppError("Your token has expired! Please log in again.", HTTP_STATUS.UNAUTHORIZED);

        sendErrorProd(error, res);
    }
};
