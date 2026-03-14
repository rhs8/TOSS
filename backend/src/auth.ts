import { Request, Response, NextFunction } from "express";
import { queryOne } from "./db";
import type { User } from "./types";

export interface AuthRequest extends Request {
  user?: User;
}

/** Placeholder: verify Firebase ID token and load user. Replace with firebase-admin auth().verifyIdToken(). */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  // TODO: Firebase Admin verifyIdToken(token) -> decodeToken.uid
  // For dev, accept a fake uid from header
  const firebaseUid = process.env.NODE_ENV === "development" && req.headers["x-dev-uid"]
    ? String(req.headers["x-dev-uid"])
    : (token as string).slice(0, 28);
  const user = await queryOne<User>("SELECT * FROM users WHERE firebase_uid = $1", [firebaseUid]);
  if (!user) {
    res.status(401).json({ error: "User not found. Sign up first." });
    return;
  }
  req.user = user;
  next();
}

/** Optional auth: attach user if token present, don't 401. */
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) {
    next();
    return;
  }
  const firebaseUid = process.env.NODE_ENV === "development" && req.headers["x-dev-uid"]
    ? String(req.headers["x-dev-uid"])
    : (token as string).slice(0, 28);
  const user = await queryOne<User>("SELECT * FROM users WHERE firebase_uid = $1", [firebaseUid]);
  req.user = user ?? undefined;
  next();
}
