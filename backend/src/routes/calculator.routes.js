import { Router } from 'express';
import {
  getCalculatorRates,
  calculateLotSize,
  calculateSpreadCost,
  calculatePipValue,
} from '../controllers/calculator.controller.js';

const router = Router();

// Public endpoints for real-time forex calculations
router.get('/rates', getCalculatorRates);
router.post('/lot-size', calculateLotSize);
router.post('/spread-cost', calculateSpreadCost);
router.post('/pip-value', calculatePipValue);

export default router;
