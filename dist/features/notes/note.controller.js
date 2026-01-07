"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.updateNote = exports.getNote = exports.createNote = exports.getAllNotes = void 0;
const note_model_1 = __importDefault(require("./note.model"));
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const http_1 = require("../../constants/http");
exports.getAllNotes = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const notes = await note_model_1.default.find({ user: req.user._id });
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        results: notes.length,
        data: { notes },
    });
});
exports.createNote = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.body.user)
        req.body.user = req.user._id;
    const newNote = await note_model_1.default.create(req.body);
    res.status(http_1.HTTP_STATUS.CREATED).json({
        status: "success",
        data: { note: newNote },
    });
});
exports.getNote = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const note = await note_model_1.default.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
        return next(new AppError_1.AppError("No note found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: { note },
    });
});
exports.updateNote = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const note = await note_model_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!note) {
        return next(new AppError_1.AppError("No note found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: { note },
    });
});
exports.deleteNote = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const note = await note_model_1.default.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
        return next(new AppError_1.AppError("No note found with that ID", http_1.HTTP_STATUS.NOT_FOUND));
    }
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: null,
    });
});
