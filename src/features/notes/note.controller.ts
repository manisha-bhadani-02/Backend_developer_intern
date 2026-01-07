import { Request, Response, NextFunction } from "express";
import Note from "./note.model";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http";

export const getAllNotes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const notes = await Note.find({ user: req.user!._id });

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        results: notes.length,
        data: { notes },
    });
});

export const createNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.user) req.body.user = req.user!._id;
    const newNote = await Note.create(req.body);

    res.status(HTTP_STATUS.CREATED).json({
        status: "success",
        data: { note: newNote },
    });
});

export const getNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user!._id });

    if (!note) {
        return next(new AppError("No note found with that ID", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: { note },
    });
});

export const updateNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user!._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!note) {
        return next(new AppError("No note found with that ID", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: { note },
    });
});

export const deleteNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user!._id });

    if (!note) {
        return next(new AppError("No note found with that ID", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: null,
    });
});
