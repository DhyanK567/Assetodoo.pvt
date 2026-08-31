import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

// Extend Express Request interface to include the user
export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      data: null,
      status: 401,
      message: 'Access Denied: No Token Provided',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret) as { userId: string };

    // Fetch full user to attach to request
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(403).json({
        data: null,
        status: 403,
        message: 'Invalid Token: User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      data: null,
      status: 403,
      message: 'Invalid Token',
    });
  }
};
