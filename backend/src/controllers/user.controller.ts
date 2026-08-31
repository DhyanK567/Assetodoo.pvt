import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is set by the auth middleware
    if (!req.user) {
      return res.status(401).json({
        data: null,
        status: 401,
        message: 'Unauthorized',
      });
    }

    res.json({
      data: req.user,
      status: 200,
      message: 'Successfully fetched profile',
    });
  } catch (error) {
    console.error('[User] GetMe error:', error);
    res.status(500).json({
      data: null,
      status: 500,
      message: 'Internal server error',
    });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({
      data: users,
      status: 200,
      message: 'Successfully fetched all users',
    });
  } catch (error) {
    console.error('[User] GetAllUsers error:', error);
    res.status(500).json({
      data: null,
      status: 500,
      message: 'Internal server error',
    });
  }
};
