import { NextFunction, Response, Router } from "express";
import jwt from "jsonwebtoken";
import auth, { AuthRequest } from "../middleware/auth";
import User from "../models/User";

const router = Router();

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

router.post(
  "/signup",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res
          .status(400)
          .json({ message: "Name, email, and password are required" });
        return;
      }

      if (password.length < 6) {
        res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res
          .status(400)
          .json({ message: "User with this email already exists" });
        return;
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

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

router.post(
  "/login",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password",
      );
      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

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
