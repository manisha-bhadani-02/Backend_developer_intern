"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.getOne = exports.createOne = exports.updateOne = exports.deleteOne = void 0;
const catchAsync_1 = require("./catchAsync");
const AppError_1 = require("./AppError");
const http_1 = require("../constants/http");
const deleteOne = (Model) => (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError_1.AppError("No document found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: null,
    });
});
exports.deleteOne = deleteOne;
const updateOne = (Model) => (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        return next(new AppError_1.AppError("No document found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: {
            data: doc,
        },
    });
});
exports.updateOne = updateOne;
const createOne = (Model) => (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(http_1.HTTP_STATUS.CREATED).json({
        status: "success",
        data: {
            data: doc,
        },
    });
});
exports.createOne = createOne;
const getOne = (Model, popOptions) => (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions)
        query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
        return next(new AppError_1.AppError("No document found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: {
            data: doc,
        },
    });
});
exports.getOne = getOne;
const getAll = (Model) => (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // @ts-ignore
    if (req.params.tourId)
        filter = { tour: req.params.tourId };
    // Allow filtering by user if strictly scoped
    // check if we processed a query "user=me" or similar in middleware, or simply rely on query params
    // But for now, standard getAll
    // EXECUTE QUERY
    const features = Model.find(filter);
    // (Note: full APIFeatures implementation with sorting/pagination is better, but maybe overkill for now unless requested. I'll stick to simple Find or add basic query support)
    const doc = await features;
    // SEND RESPONSE
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        results: doc.length,
        data: {
            data: doc,
        },
    });
});
exports.getAll = getAll;
