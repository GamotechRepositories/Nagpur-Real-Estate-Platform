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
 * Format Area with unit
 */
export const formatArea = (area, unit = 'sq.ft') => {
  if (!area) return 'N/A';
  return `${Number(area).toLocaleString('en-IN')} ${unit}`;
};

/**
 * Format Date to readable format
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleDateString('en-IN', options);
};

/**
 * Format Date + Time
 */
export const formatDateTime = (dateString) => {
  return formatDate(dateString, true);
};

/**
 * Format Relative Time (e.g., '2 hours ago', 'yesterday')
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};

/**
 * Format Role label for display
 */
export const formatRole = (role) => {
  if (!role) return 'Staff';
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'MODERATOR':
      return 'Moderator';
    case 'CRM_MANAGER':
      return 'CRM Manager';
    case 'CONTENT_EDITOR':
      return 'Content Editor';
    case 'AGENT':
      return 'Nagpur Agent';
    case 'OWNER':
      return 'Property Owner';
    case 'USER':
      return 'Buyer / User';
    default:
      return role;
  }
};
