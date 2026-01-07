import nodemailer from "nodemailer";

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

export const sendEmail = async (options: EmailOptions) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
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
