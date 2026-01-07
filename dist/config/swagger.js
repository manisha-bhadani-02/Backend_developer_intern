"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const package_json_1 = require("../../package.json");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ServerSide API Docs",
            version: package_json_1.version,
            description: "API Documentation for ServerSide Login & Dashboard System",
            contact: {
                name: "Developer Support",
                email: "support@serverside.com",
            },
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Development Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "60d0fe4f5311236168a109ca" },
                        name: { type: "string", example: "John Doe" },
                        email: { type: "string", example: "john@example.com" },
                        role: { type: "string", enum: ["user", "admin"], example: "user" },
                        active: { type: "boolean", example: true },
                        themePreference: { type: "string", enum: ["light", "dark"], example: "light" },
                    },
                },
                Note: {
                    type: "object",
                    required: ["title", "content"],
                    properties: {
                        _id: { type: "string", example: "64f1a2b3c9e8d7f6a5b4c3d2" },
                        title: { type: "string", example: "Meeting Notes" },
                        content: { type: "string", example: "Discussed project roadmap and Q1 goals." },
                        user: { type: "string", example: "60d0fe4f5311236168a109ca" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Task: {
                    type: "object",
                    required: ["title"],
                    properties: {
                        _id: { type: "string", example: "64f1a2b3c9e8d7f6a5b4c3d3" },
                        title: { type: "string", example: "Fix login bug" },
                        description: { type: "string", example: "User cannot login with special characters" },
                        status: { type: "string", enum: ["pending", "in-progress", "completed"], example: "pending" },
                        user: { type: "string", example: "60d0fe4f5311236168a109ca" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Product: {
                    type: "object",
                    required: ["name", "price"],
                    properties: {
                        _id: { type: "string", example: "64f1a2b3c9e8d7f6a5b4c3d4" },
                        name: { type: "string", example: "Premium Headphones" },
                        description: { type: "string", example: "Noise canceling wireless headphones" },
                        price: { type: "number", example: 299.99 },
                        stock: { type: "number", example: 50 },
                        category: { type: "string", example: "Electronics" },
                        createdBy: { type: "string", example: "60d0fe4f5311236168a109ca" },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "error" },
                        message: { type: "string", example: "Something went wrong" },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/features/**/*.routes.ts", "./src/features/**/*.ts"], // Path to the API docs
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
