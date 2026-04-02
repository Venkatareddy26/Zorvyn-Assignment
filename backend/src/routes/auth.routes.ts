import { Router, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginValidation } from '../middleware/validate';
import { handleValidationErrors } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/auth/login
router.post('/login', loginValidation, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

export default router;
