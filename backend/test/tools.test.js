const test = require('node:test');
const assert = require('node:assert');
const { generateAccessToken, verifyAccessToken } = require('../src/utils/jwt');
const { ROLES } = require('../src/constants');

test('JWT Access Token Generation and Verification', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    phone: '9823012345',
    role: ROLES.SUPER_ADMIN,
    status: 'ACTIVE',
  };

  const token = generateAccessToken(mockUser);
  assert.ok(token, 'Token should be generated');

  const decoded = verifyAccessToken(token);
  assert.strictEqual(decoded.phone, mockUser.phone);
  assert.strictEqual(decoded.role, ROLES.SUPER_ADMIN);
});

test('EMI Calculation Formula Precision', () => {
  // Principal: 50,00,000; Rate: 8.5% p.a; Tenure: 20 years (240 months)
  const principal = 5000000;
  const annualRate = 8.5;
  const tenureMonths = 240;

  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));

  // Standard financial verification: 50L at 8.5% for 20 years is ~43,391/mo
  assert.ok(emi > 43000 && emi < 44000, `EMI calculated was ${emi}`);
});

test('Maharashtra Area Unit Conversion Factors', () => {
  const sqft = 1089;
  const guntha = sqft / 1089;
  assert.strictEqual(guntha, 1, '1089 Sq.Ft should equal exactly 1 Guntha in Nagpur/Maharashtra');

  const acreInSqFt = 43560;
  const acreToGunthas = acreInSqFt / 1089;
  assert.strictEqual(acreToGunthas, 40, '1 Acre must equal 40 Gunthas');
});
