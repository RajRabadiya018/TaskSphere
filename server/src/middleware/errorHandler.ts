import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// global error handling
const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("Unhandled error:", err);

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      message: `Invalid ${err.path}: "${err.value}" is not a valid ID`,
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ message: messages.join(", ") });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    res.status(409).json({
      message: `A record with that ${field} already exists`,
    });
    return;
  }

  if (err.type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON in request body" });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message || "An unexpected error occurred";

  res.status(statusCode).json({ message });
};

export default errorHandler;
