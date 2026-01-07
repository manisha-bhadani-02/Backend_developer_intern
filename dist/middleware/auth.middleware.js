"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../features/users/user.model"));
const AppError_1 = require("../utils/AppError");
const catchAsync_1 = require("../utils/catchAsync");
const http_1 = require("../constants/http");
exports.protect = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new AppError_1.AppError("You are not logged in! Please log in to get access.", http_1.HTTP_STATUS.UNAUTHORIZED));
    }
    // 2) Verification token
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // 3) Check if user still exists
    const currentUser = await user_model_1.default.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError_1.AppError("The user belonging to this token does no longer exist.", http_1.HTTP_STATUS.UNAUTHORIZED));
    }
    // 4) Check if user changed password after the token was issued
    // (Optional: Implement changedPasswordAfter in User model if needed, strictly required for high security)
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return next(new AppError('User recently changed password! Please log in again.', 401));
    // }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError_1.AppError("You do not have permission to perform this action", http_1.HTTP_STATUS.FORBIDDEN));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
