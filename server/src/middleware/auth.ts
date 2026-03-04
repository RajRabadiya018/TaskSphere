import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to carry the authenticated user's ID
export interface AuthRequest extends Request {
    userId?: string;
}

// JWT verification middleware — extracts the token from the Authorization header,
// verifies it, and attaches userId to the request for downstream route handlers
const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        // Expect format: "Bearer <token>"
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "No token provided, authorization denied" });
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "No token provided, authorization denied" });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        // Verify token and extract userId payload
        const decoded = jwt.verify(token, secret) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error: any) {
        // Handle specific JWT errors with user-friendly messages
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token has expired" });
            return;
        }
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        res.status(500).json({ message: "Server error during authentication" });
    }
};

export default auth;
