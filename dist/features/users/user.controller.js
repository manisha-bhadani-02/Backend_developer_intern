"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = exports.createUser = exports.deleteMe = exports.updateMe = exports.getMe = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const factory = __importStar(require("../../utils/handlerFactory"));
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const http_1 = require("../../constants/http");
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
const getMe = (req, res, next) => {
    req.params.id = req.user._id.toString();
    next();
};
exports.getMe = getMe;
exports.updateMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError_1.AppError("This route is not for password updates. Please use /updateMyPassword.", http_1.HTTP_STATUS.BAD_REQUEST));
    }
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email", "themePreference");
    // 3) Update user document
    const updatedUser = await user_model_1.default.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true,
    });
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
});
exports.deleteMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    await user_model_1.default.findByIdAndUpdate(req.user._id, { active: false });
    res.status(http_1.HTTP_STATUS.OK).json({
        status: "success",
        data: null,
    });
});
const createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not defined! Please use /signup instead",
    });
};
exports.createUser = createUser;
exports.getAllUsers = factory.getAll(user_model_1.default);
exports.getUser = factory.getOne(user_model_1.default);
exports.updateUser = factory.updateOne(user_model_1.default); // Do NOT update passwords with this!
exports.deleteUser = factory.deleteOne(user_model_1.default);
