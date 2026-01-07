import { Request, Response, NextFunction } from "express";
import Task from "./task.model";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http";

export const getAllTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tasks = await Task.find({ user: req.user!._id });

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        results: tasks.length,
        data: { tasks },
    });
});

export const createTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.user) req.body.user = req.user!._id;
    const newTask = await Task.create(req.body);

    res.status(HTTP_STATUS.CREATED).json({
        status: "success",
        data: { task: newTask },
    });
});

export const getTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const task = await Task.findOne({ _id: req.params.id, user: req.user!._id });

    if (!task) {
        return next(new AppError("No task found with that ID", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: { task },
    });
});

export const updateTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user!._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!task) {
        return next(new AppError("No task found with that ID", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: { task },
    });
});

export const deleteTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user!._id });

    if (!task) {
        return next(new AppError("No task found with that ID", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: null,
    });
});
