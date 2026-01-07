"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // Define the email options
    const mailOptions = {
        from: "ServerSide App <noreply@serverside.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // Can add HTML support
    };
    // Turn off TS check for this line as specific nodemailer types might mismatch slightly
    // @ts-ignore
    await transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
