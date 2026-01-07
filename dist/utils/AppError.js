"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const http_1 = require("../constants/http");
class AppError extends Error {
    constructor(message, statusCode = http_1.HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
