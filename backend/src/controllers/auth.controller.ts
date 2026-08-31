import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        data: null,
        status: 400,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        data: null,
        status: 401,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        data: null,
        status: 401,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn: '8h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      data: {
        token,
        user: userWithoutPassword,
      },
      status: 200,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      data: null,
      status: 500,
      message: 'Internal server error',
    });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate request
    if (!name || !email || !password) {
      return res.status(400).json({
        data: null,
        status: 400,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        data: null,
        status: 409,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    // @ts-ignore - Bypass Prisma type check until generate is run
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
      },
    });

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      secret,
      { expiresIn: '8h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      data: {
        token,
        user: userWithoutPassword,
      },
      status: 201,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    res.status(500).json({
      data: null,
      status: 500,
      message: 'Internal server error',
    });
  }
};
