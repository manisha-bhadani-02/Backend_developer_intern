import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import { catchAsync } from "./catchAsync";
import { AppError } from "./AppError";
import { HTTP_STATUS } from "../constants/http";

export const deleteOne = (Model: Model<any>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError("No document found with that ID", HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({ // 204 for no content, but 200 often preferred for confirmation
            status: "success",
            data: null,
        });
    });

export const updateOne = (Model: Model<any>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError("No document found with that ID", HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

export const createOne = (Model: Model<any>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.create(req.body);

        res.status(HTTP_STATUS.CREATED).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

export const getOne = (Model: Model<any>, popOptions?: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError("No document found with that ID", HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

export const getAll = (Model: Model<any>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        // To allow for nested GET reviews on tour (hack)
        let filter = {};
        // @ts-ignore
        if (req.params.tourId) filter = { tour: req.params.tourId };

        // Allow filtering by user if strictly scoped
        // check if we processed a query "user=me" or similar in middleware, or simply rely on query params
        // But for now, standard getAll

        // EXECUTE QUERY
        const features = Model.find(filter);
        // (Note: full APIFeatures implementation with sorting/pagination is better, but maybe overkill for now unless requested. I'll stick to simple Find or add basic query support)

        const doc = await features;

        // SEND RESPONSE
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });
