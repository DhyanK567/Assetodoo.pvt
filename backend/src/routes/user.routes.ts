import { Router } from 'express';
import { getMe, getAllUsers } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All user routes are protected
router.use(authenticateToken);

router.get('/me', getMe);
router.get('/', getAllUsers);

export default router;
