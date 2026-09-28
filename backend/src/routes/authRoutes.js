import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register/', authController.register);
router.post('/login/', authController.login);
router.post('/refresh/', authController.refreshToken);
router.get('/profile/', authenticate, authController.getProfile);
router.put('/profile/', authenticate, authController.updateProfile);
router.patch('/profile/', authenticate, authController.updateProfile);

export default router;
