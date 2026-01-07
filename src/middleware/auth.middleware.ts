import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import User, { IUser } from "../features/users/user.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { HTTP_STATUS } from "../constants/http";

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access.", HTTP_STATUS.UNAUTHORIZED));
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user belonging to this token does no longer exist.", HTTP_STATUS.UNAUTHORIZED));
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

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user!.role)) {
            return next(new AppError("You do not have permission to perform this action", HTTP_STATUS.FORBIDDEN));
        }
        next();
    };
};
