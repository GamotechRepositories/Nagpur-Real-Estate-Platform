const LoanRequest = require('../models/LoanRequest');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Calculate Home Loan EMI, Total Interest, Total Payable & Amortization
 */
const calculateEmi = (req, res, next) => {
  try {
    const { loanAmount, interestRate, tenureYears, downPayment = 0, propertyPrice } = req.body;

    const principal = propertyPrice ? (propertyPrice - downPayment) : Number(loanAmount);
    const annualRate = Number(interestRate);
    const tenureMonths = Number(tenureYears) * 12;

    if (!principal || principal <= 0 || !annualRate || annualRate <= 0 || !tenureMonths || tenureMonths <= 0) {
      return sendError(res, 'Invalid input parameters for EMI calculation', 'INVALID_INPUT', {}, 400);
    }

    const monthlyRate = annualRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));

    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;

    // Generate yearly breakdown preview
    const yearlyBreakdown = [];
    let balance = principal;
    for (let year = 1; year <= Math.min(Number(tenureYears), 30); year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = emi - interestForMonth;
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance -= principalForMonth;
      }

      yearlyBreakdown.push({
        year,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        balanceRemaining: Math.max(0, Math.round(balance)),
      });
    }

    return sendSuccess(res, 'EMI calculated successfully', {
      principal: Math.round(principal),
      monthlyEmi: emi,
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayment),
      tenureMonths,
      yearlyBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Area Converter for Indian Real Estate units
 */
const convertArea = (req, res, next) => {
  try {
    const { value, fromUnit } = req.body;
    const val = parseFloat(value);

    if (isNaN(val) || val <= 0) {
      return sendError(res, 'Value must be a positive number', 'INVALID_VALUE', {}, 400);
    }

    // Convert from input unit to standard Square Feet
    // 1 Sq Mtr = 10.76391 Sq Ft
    // 1 Sq Yard (Gaj) = 9 Sq Ft
    // 1 Guntha = 1089 Sq Ft (Maharashtra standard)
    // 1 Acre = 43560 Sq Ft
    // 1 Hectare = 107639.104 Sq Ft
    const factorsToSqFt = {
      'sqft': 1,
      'sqmtr': 10.76391,
      'sqyd': 9,
      'guntha': 1089,
      'acre': 43560,
      'hectare': 107639.104,
    };

    const unitKey = (fromUnit || 'sqft').toLowerCase().replace(/[^a-z]/g, '');
    const toSqFtFactor = factorsToSqFt[unitKey];

    if (!toSqFtFactor) {
      return sendError(res, `Unsupported area unit: ${fromUnit}`, 'UNSUPPORTED_UNIT', {}, 400);
    }

    const totalSqFt = val * toSqFtFactor;

    const conversions = {
      sqFt: parseFloat(totalSqFt.toFixed(2)),
      sqMtr: parseFloat((totalSqFt / factorsToSqFt.sqmtr).toFixed(2)),
      sqYd: parseFloat((totalSqFt / factorsToSqFt.sqyd).toFixed(2)),
      guntha: parseFloat((totalSqFt / factorsToSqFt.guntha).toFixed(3)),
      acre: parseFloat((totalSqFt / factorsToSqFt.acre).toFixed(4)),
      hectare: parseFloat((totalSqFt / factorsToSqFt.hectare).toFixed(4)),
    };

    return sendSuccess(res, 'Area converted successfully', {
      originalValue: val,
      originalUnit: fromUnit,
      conversions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Home Loan Request
 */
const submitLoanRequest = async (req, res, next) => {
  try {
    const body = req.body;
    const loanRequest = await LoanRequest.create(body);

    return sendSuccess(
      res,
      'Your home loan request has been registered. Our partner banking advisor will contact you within 24 hours.',
      loanRequest,
      null,
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateEmi,
  convertArea,
  submitLoanRequest,
};

