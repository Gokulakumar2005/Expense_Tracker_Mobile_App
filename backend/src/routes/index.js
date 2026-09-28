import { Router } from 'express';
import authRoutes from './authRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/dashboard', dashboardRoutes);

// Centralized monthly reports endpoints matching /api/reports/monthly/
const reportRouter = Router();
reportRouter.use(authenticate);
reportRouter.get('/monthly', dashboardController.getReports);
reportRouter.get('/monthly/', dashboardController.getReports);
reportRouter.get('/monthly/pdf', dashboardController.downloadMonthlyReportPdf);
reportRouter.get('/monthly/pdf/', dashboardController.downloadMonthlyReportPdf);
router.use('/reports', reportRouter);

export default router;
