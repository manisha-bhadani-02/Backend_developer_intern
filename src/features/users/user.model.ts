import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "user" | "admin";
    active: boolean;
    themePreference: "light" | "dark";
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    isVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
    changedPasswordAfter(JWTTimestamp: number): boolean;
    createPasswordResetToken(): string;
    createEmailVerificationToken(): string;
    generateAuthToken(): string;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Please tell us your name!"],
        },
        email: {
            type: String,
            required: [true, "Please provide your email"],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: 8,
            select: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
        themePreference: {
            type: String,
            enum: ["light", "dark"],
            default: "light",
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        isVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
    },
    {
        timestamps: true,
    }
);

// Encrypt password before save
// Encrypt password before save
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password!, 12);
});

// Instance method to checks if password is correct
userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password!);
};

// Instance method to create reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return verificationToken;
};

// Instance method to generate JWT
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as any,
    });
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
