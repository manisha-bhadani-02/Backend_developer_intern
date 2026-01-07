"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTask = exports.createTask = exports.getAllTasks = void 0;
const task_model_1 = __importDefault(require("./task.model"));
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const http_1 = require("../../constants/http");
exports.getAllTasks = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tasks = await task_model_1.default.find({ user: req.user._id });
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        results: tasks.length,
        data: { tasks },
    });
});
exports.createTask = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.body.user)
        req.body.user = req.user._id;
    const newTask = await task_model_1.default.create(req.body);
    res.status(http_1.HTTP_STATUS.CREATED).json({
        status: "success",
        data: { task: newTask },
    });
});
exports.getTask = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const task = await task_model_1.default.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
        return next(new AppError_1.AppError("No task found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: { task },
    });
});
exports.updateTask = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const task = await task_model_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!task) {
        return next(new AppError_1.AppError("No task found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: { task },
    });
});
exports.deleteTask = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const task = await task_model_1.default.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
        return next(new AppError_1.AppError("No task found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: null,
    });
});
