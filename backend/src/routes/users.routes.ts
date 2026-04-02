import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UsersService } from '../services/users.service';
import { createUserValidation, updateUserValidation } from '../middleware/validate';
import { handleValidationErrors } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate);

// GET /api/users — list all users (Admin only)
router.get('/', authorize('admin'), async (req: AuthRequest, res: Response) => {
  const users = await UsersService.getAll();
  const stats = await UsersService.getStats();
  res.json({ success: true, data: { users, stats } });
});

// GET /api/users/:id — get a single user (Admin only)
router.get('/:id', authorize('admin'), async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const user = await UsersService.getById(id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
});

// POST /api/users — create a new user (Admin only)
router.post('/', authorize('admin'), createUserValidation, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await UsersService.create(name, email, password, role);
    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/users/:id — update user role/status (Admin only)
router.patch('/:id', authorize('admin'), updateUserValidation, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, role, status } = req.body;
    const user = await UsersService.update(id, { name, role, status });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id — deactivate user (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (req.user && req.user.id === id) {
      res.status(400).json({ success: false, error: 'Cannot deactivate your own account' });
      return;
    }
    await UsersService.delete(id);
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
