/**
 * Format Indian Currency to Lakhs / Crores or comma separated Rupees
 */
export const formatIndianPrice = (price, priceUnit = 'Total') => {
  if (price === undefined || price === null || isNaN(price)) return 'Price on Request';

  const num = Number(price);

  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${cr} Cr${priceUnit === 'Per Month' ? ' / mo' : ''}`;
  }

  if (num >= 100000) {
    const lakh = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${lakh} Lac${priceUnit === 'Per Month' ? ' / mo' : ''}`;
  }

  return `₹ ${num.toLocaleString('en-IN')}${priceUnit === 'Per Month' ? ' / mo' : ''}`;
};

/**
 * Format Area with commas
 */
export const formatArea = (area, unit = 'sq.ft') => {
  if (!area) return 'N/A';
  return `${Number(area).toLocaleString('en-IN')} ${unit}`;
};

/**
 * Approximate monthly EMI based on 8.5% interest over 20 years
 */
export const calculateEstimateEmi = (price) => {
  if (!price || price <= 0) return 'N/A';
  const principal = price * 0.8; // 80% loan
  const monthlyRate = 8.5 / 12 / 100;
  const months = 240;
  const factor = Math.pow(1 + monthlyRate, months);
  const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  return `₹ ${emi.toLocaleString('en-IN')}/mo`;
};

/**
 * Format Date to readable Indian standard
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

