import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// Global error handler — catches all errors forwarded via next(error) from route handlers.
// Translates Mongoose-specific errors into user-friendly JSON responses.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("Unhandled error:", err);

  // Invalid ObjectId format (e.g. passing "abc" where a MongoDB ID is expected)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      message: `Invalid ${err.path}: "${err.value}" is not a valid ID`,
    });
    return;
  }

  // Schema validation failed (e.g. missing required field, value too long)
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ message: messages.join(", ") });
    return;
  }

  // Duplicate key error (e.g. registering with an email that already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    res.status(409).json({
      message: `A record with that ${field} already exists`,
    });
    return;
  }

  // Malformed JSON in request body
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON in request body" });
    return;
  }

  // Fallback: hide internal error details in production
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message || "An unexpected error occurred";

  res.status(statusCode).json({ message });
};

export default errorHandler;
