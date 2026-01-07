"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const AppError_1 = require("./utils/AppError");
const http_1 = require("./constants/http");
// Routes
const auth_routes_1 = __importDefault(require("./features/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./features/users/user.routes"));
const task_routes_1 = __importDefault(require("./features/tasks/task.routes"));
const note_routes_1 = __importDefault(require("./features/notes/note.routes"));
const product_routes_1 = __importDefault(require("./features/products/product.routes"));
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(rateLimit_middleware_1.globalLimiter);
// Body Parser Middleware
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/tasks", task_routes_1.default);
app.use("/api/v1/notes", note_routes_1.default);
app.use("/api/v1/products", product_routes_1.default);
// Swagger
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
// Docs Route
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// Health Check
app.get("/health", (req, res) => {
    res.status(http_1.HTTP_STATUS.OK).json({ status: "success", message: "Server is running" });
});
// 404 Handler
app.all(/(.*)/, (req, res, next) => {
    next(new AppError_1.AppError(`Can't find ${req.originalUrl} on this server!`, http_1.HTTP_STATUS.NOT_FOUND));
});
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
