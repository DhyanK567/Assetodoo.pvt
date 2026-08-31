import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// @ts-ignore - Temporary bypass until prisma generate is run manually
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes); // Handles /user/me
app.use('/api/v1/users', userRoutes); // Handles /users

// Health Check Endpoint
app.get('/api/v1/status', async (req, res) => {
  try {
    // Quick DB query to verify connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      data: { status: 'healthy', api: 'assetflow-backend', db: 'connected' },
      status: 200,
      message: 'Success',
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      data: { status: 'unhealthy', error: String(error) },
      status: 500,
      message: 'Database Connection Error',
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 AssetFlow Backend running on port ${PORT}`);
  console.log(`🔗 Database: PostgreSQL`);
  console.log(`=========================================`);
});
