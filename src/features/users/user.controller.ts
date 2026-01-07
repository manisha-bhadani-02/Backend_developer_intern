import { Request, Response, NextFunction } from "express";
import User from "./user.model";
import * as factory from "../../utils/handlerFactory";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http";

const filterObj = (obj: any, ...allowedFields: string[]) => {
    const newObj: any = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
    req.params.id = req.user!._id.toString();
    next();
};

export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword.", HTTP_STATUS.BAD_REQUEST));
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email", "themePreference");

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user!._id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
});

export const deleteMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user!._id, { active: false });

    res.status(HTTP_STATUS.OK).json({ // 204
        status: "success",
        data: null,
    });
});

export const createUser = (req: Request, res: Response) => {
    res.status(500).json({
        status: "error",
        message: "This route is not defined! Please use /signup instead",
    });
};

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User); // Do NOT update passwords with this!
export const deleteUser = factory.deleteOne(User);
