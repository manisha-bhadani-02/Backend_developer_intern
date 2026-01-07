import { HTTP_STATUS } from "../constants/http";

export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
