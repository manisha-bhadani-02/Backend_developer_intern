import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middleware/rateLimit.middleware";
import { globalErrorHandler } from "./middleware/error.middleware";
import { AppError } from "./utils/AppError";
import { HTTP_STATUS } from "./constants/http";

// Routes
import authRoutes from "./features/auth/auth.routes";
import userRoutes from "./features/users/user.routes";
import taskRoutes from "./features/tasks/task.routes";
import noteRoutes from "./features/notes/note.routes";
import productRoutes from "./features/products/product.routes";

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(globalLimiter);

// Body Parser Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/products", productRoutes);

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

// Docs Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get("/health", (req, res) => {
    res.status(HTTP_STATUS.OK).json({ status: "success", message: "Server is running" });
});

// 404 Handler
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, HTTP_STATUS.NOT_FOUND));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
