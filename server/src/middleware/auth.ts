import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

// JWT verification
const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

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

        // Verifing token
        const decoded = jwt.verify(token, secret) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error: any) {
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
