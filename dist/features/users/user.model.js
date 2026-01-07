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
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Encrypt password before save
// Encrypt password before save
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    this.password = await bcryptjs_1.default.hash(this.password, 12);
});
// Instance method to checks if password is correct
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
// Instance method to create reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
};
// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto_1.default
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return verificationToken;
};
// Instance method to generate JWT
userSchema.methods.generateAuthToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
