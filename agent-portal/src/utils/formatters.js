export const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lac`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')} K`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateString);
};

