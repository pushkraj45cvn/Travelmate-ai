/**
 * Format currency amount
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format date
 */
export const formatDate = (date, format = 'PPP') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

/**
 * Get days between two dates
 */
export const getDaysBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff) + 1;
};

/**
 * Get trip status color
 */
export const getTripStatusColor = (status) => {
  const colors = {
    planning: 'badge-primary',
    ongoing: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    archived: 'badge-warning',
  };
  return colors[status] || 'badge-primary';
};

/**
 * Get expense category icon name
 */
export const getCategoryIcon = (category) => {
  const icons = {
    flights: '✈️',
    hotels: '🏨',
    food: '🍽️',
    shopping: '🛍️',
    fuel: '⛽',
    transport: '🚗',
    activities: '🎯',
    miscellaneous: '📦',
  };
  return icons[category] || '📦';
};

/**
 * Get travel type color
 */
export const getTravelTypeColor = (type) => {
  const colors = {
    solo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    family: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    friends: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    couple: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    business: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    adventure: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    luxury: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    backpacking: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};
