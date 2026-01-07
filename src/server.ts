import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION ", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: any) => {
  console.error("UNCAUGHT EXCEPTION ", err);
  process.exit(1);
});
