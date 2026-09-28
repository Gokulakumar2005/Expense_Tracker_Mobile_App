import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', dashboardController.getDashboard);
router.get('/reports/', dashboardController.getReports);

export default router;
