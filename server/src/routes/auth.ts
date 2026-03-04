import { NextFunction, Response, Router } from "express";
import jwt from "jsonwebtoken";
import auth, { AuthRequest } from "../middleware/auth";
import User from "../models/User";

const router = Router();

// ---------------------------------------------------------------------------
// Helper — generate JWT token
// ---------------------------------------------------------------------------
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

// ---------------------------------------------------------------------------
// POST /api/auth/signup — Register a new user
// ---------------------------------------------------------------------------
router.post(
  "/signup",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        res
          .status(400)
          .json({ message: "Name, email, and password are required" });
        return;
      }

      // Validate password length
      if (password.length < 6) {
        res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res
          .status(400)
          .json({ message: "User with this email already exists" });
        return;
      }

      // Create user
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      // Generate token
      const token = generateToken(user._id.toString());

      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error: unknown) {
      next(error);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/auth/login — Authenticate user & return token
// ---------------------------------------------------------------------------
router.post(
  "/login",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      // Find user by email (explicitly select password since it's hidden by default)
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password",
      );
      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      // Generate token
      const token = generateToken(user._id.toString());

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error: unknown) {
      next(error);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/auth/me — Get current authenticated user
// ---------------------------------------------------------------------------
router.get(
  "/me",
  auth,
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
