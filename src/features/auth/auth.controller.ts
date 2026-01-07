import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User, { IUser } from "../users/user.model";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { sendEmail } from "../../utils/email";
import { HTTP_STATUS } from "../../constants/http";

const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const token = user.generateAuthToken();

    // Cookie options
    const cookieOptions: any = {
        expires: new Date(
            Date.now() + 24 * 60 * 60 * 1000 // 1 day generic
        ),
        httpOnly: true, // Security against XSS
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

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

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    const newUser = await User.create({
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
        await sendEmail({
            email: newUser.email,
            subject: "Please verify your email address",
            message,
        });

        res.status(HTTP_STATUS.CREATED).json({
            status: "success",
            message: "Token sent to email! Please verify your account.",
        });
    } catch (err) {
        if (process.env.NODE_ENV === "development") {
            // In dev, if email fails, we still want to allow testing the flow via console link
            console.error("Email sending failed, but continuing in DEV mode. Error:", err);
            return res.status(HTTP_STATUS.CREATED).json({
                status: "success",
                message: "Email failed to send (check console for link), but user created for testing.",
            });
        }

        newUser.emailVerificationToken = undefined;
        newUser.emailVerificationExpires = undefined;
        await newUser.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending the email. Try again later!", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("Token is invalid or has expired", HTTP_STATUS.BAD_REQUEST));
    }

    user.active = true;
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, HTTP_STATUS.OK, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password", HTTP_STATUS.BAD_REQUEST));
    }

    // 2) Check if user exists & password is correct
    const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");

    if (!user) {
        return next(new AppError("Incorrect email or password", HTTP_STATUS.UNAUTHORIZED));
    }

    // Check locking
    if (user.lockUntil && user.lockUntil > new Date()) {
        return next(new AppError("Account is locked due to multiple failed login attempts. Please try again later.", HTTP_STATUS.FORBIDDEN));
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
        return next(new AppError("Incorrect email or password", HTTP_STATUS.UNAUTHORIZED));
    }

    // Reset attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    // 3) If everything ok, send token
    sendToken(user, HTTP_STATUS.OK, res);
});

export const logout = (req: Request, res: Response) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(HTTP_STATUS.OK).json({ status: "success" });
};

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("There is no user with email address.", HTTP_STATUS.NOT_FOUND));
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
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message,
        });

        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: "Token sent to email!",
        });
    } catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.error("Email sending failed, but continuing in DEV mode. Error:", err);
            return res.status(HTTP_STATUS.OK).json({
                status: "success",
                message: "Email failed to send (check console for link) but token generated.",
            });
        }

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending the email. Try again later!", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError("Token is invalid or has expired", HTTP_STATUS.BAD_REQUEST));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0; // clear locks on reset
    user.lockUntil = undefined;
    await user.save();

    // 3) Log the user in, send JWT
    sendToken(user, HTTP_STATUS.OK, res);
});

// Dashboard Lock / Verify Password specifically for sensitive actions or "unlocking" screen
export const verifyPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    // User is already attached to req by protect middleware (which we will build next)
    const user = await User.findById((req as any).user.id).select("+password");

    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError("Incorrect password", HTTP_STATUS.UNAUTHORIZED));
    }

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        message: "Password verified",
    });
});
