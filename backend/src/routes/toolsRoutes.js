const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/toolsController');
const { validateBody, loanRequestCreateSchema } = require('../validators');

// Financial calculators
router.post('/emi-calculate', toolsController.calculateEmi);
router.post('/area-convert', toolsController.convertArea);
router.post('/loan-request', validateBody(loanRequestCreateSchema), toolsController.submitLoanRequest);

module.exports = router;
