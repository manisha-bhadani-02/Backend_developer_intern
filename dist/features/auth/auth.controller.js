"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.verifyEmail = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../users/user.model"));
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const email_1 = require("../../utils/email");
const http_1 = require("../../constants/http");
const sendToken = (user, statusCode, res) => {
    const token = user.generateAuthToken();
    // Cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000 // 1 day generic
        ),
        httpOnly: true, // Security against XSS
    };
    if (process.env.NODE_ENV === "production")
        cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    // Remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
exports.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const newUser = await user_model_1.default.create({
        name,
        email,
        password,
        role,
    });
    const verificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });
    const verifyURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verifyEmail/${verificationToken}`;
    const message = `Please verify your email address by clicking on the following link: ${verifyURL}`;
    if (process.env.NODE_ENV === "development") {
        console.log("-----------------------------------------");
        console.log("Email Verification URL:", verifyURL);
        console.log("-----------------------------------------");
    }
    try {
        await (0, email_1.sendEmail)({
            email: newUser.email,
            subject: "Please verify your email address",
            message,
        });
        res.status(http_1.HTTP_STATUS.CREATED).json({
            status: "success",
            message: "Token sent to email! Please verify your account.",
        });
    }
    catch (err) {
        if (process.env.NODE_ENV === "development") {
            // In dev, if email fails, we still want to allow testing the flow via console link
            console.error("Email sending failed, but continuing in DEV mode. Error:", err);
            return res.status(http_1.HTTP_STATUS.CREATED).json({
                status: "success",
                message: "Email failed to send (check console for link), but user created for testing.",
            });
        }
        newUser.emailVerificationToken = undefined;
        newUser.emailVerificationExpires = undefined;
        await newUser.save({ validateBeforeSave: false });
        return next(new AppError_1.AppError("There was an error sending the email. Try again later!", http_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
exports.verifyEmail = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hashedToken = crypto_1.default.createHash("sha256").update(req.params.token).digest("hex");
    const user = await user_model_1.default.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new AppError_1.AppError("Token is invalid or has expired", http_1.HTTP_STATUS.BAD_REQUEST));
    }
    user.active = true;
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    sendToken(user, http_1.HTTP_STATUS.OK, res);
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError_1.AppError("Please provide email and password", http_1.HTTP_STATUS.BAD_REQUEST));
    }
    // 2) Check if user exists & password is correct
    const user = await user_model_1.default.findOne({ email }).select("+password +loginAttempts +lockUntil");
    if (!user) {
        return next(new AppError_1.AppError("Incorrect email or password", http_1.HTTP_STATUS.UNAUTHORIZED));
    }
    // Check locking
    if (user.lockUntil && user.lockUntil > new Date()) {
        return next(new AppError_1.AppError("Account is locked due to multiple failed login attempts. Please try again later.", http_1.HTTP_STATUS.FORBIDDEN));
    }
    // Check password
    if (!(await user.matchPassword(password))) {
        // Increment login attempts
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // Lock for 1 hour
            user.loginAttempts = 0; // Reset counter so after 1 hour they get fresh tries? Or keep it? Usually reset.
        }
        await user.save({ validateBeforeSave: false });
        return next(new AppError_1.AppError("Incorrect email or password", http_1.HTTP_STATUS.UNAUTHORIZED));
    }
    // Reset attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });
    // 3) If everything ok, send token
    sendToken(user, http_1.HTTP_STATUS.OK, res);
});
const logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(http_1.HTTP_STATUS.OK).json({ status: "success" });
};
exports.logout = logout;
exports.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await user_model_1.default.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError_1.AppError("There is no user with email address.", http_1.HTTP_STATUS.NOT_FOUND));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    if (process.env.NODE_ENV === "development") {
        console.log("-----------------------------------------");
        console.log("Password Reset URL:", resetURL);
        console.log("-----------------------------------------");
    }
    try {
        await (0, email_1.sendEmail)({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message,
        });
        res.status(http_1.HTTP_STATUS.OK).json({
            status: "success",
            message: "Token sent to email!",
        });
    }
    catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.error("Email sending failed, but continuing in DEV mode. Error:", err);
            return res.status(http_1.HTTP_STATUS.OK).json({
                status: "success",
                message: "Email failed to send (check console for link) but token generated.",
            });
        }
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError_1.AppError("There was an error sending the email. Try again later!", http_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto_1.default.createHash("sha256").update(req.params.token).digest("hex");
    const user = await user_model_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError_1.AppError("Token is invalid or has expired", http_1.HTTP_STATUS.BAD_REQUEST));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0; // clear locks on reset
    user.lockUntil = undefined;
    await user.save();
    // 3) Log the user in, send JWT
    sendToken(user, http_1.HTTP_STATUS.OK, res);
});
// Dashboard Lock / Verify Password specifically for sensitive actions or "unlocking" screen
exports.verifyPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { password } = req.body;
    // User is already attached to req by protect middleware (which we will build next)
    const user = await user_model_1.default.findById(req.user.id).select("+password");
    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError_1.AppError("Incorrect password", http_1.HTTP_STATUS.UNAUTHORIZED));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        message: "Password verified",
    });
});
