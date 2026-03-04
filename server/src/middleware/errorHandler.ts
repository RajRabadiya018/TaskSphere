import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Global Error Handler Middleware
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log the full error in development
  console.error("Unhandled error:", err);

  // Mongoose CastError — invalid ObjectId format
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      message: `Invalid ${err.path}: "${err.value}" is not a valid ID`,
    });
    return;
  }

  // Mongoose ValidationError — schema validation failed
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ message: messages.join(", ") });
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    res.status(409).json({
      message: `A record with that ${field} already exists`,
    });
    return;
  }

  // JSON parse error
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON in request body" });
    return;
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message || "An unexpected error occurred";

  res.status(statusCode).json({ message });
};

export default errorHandler;
