/**
 * Generate a random token string
 */
const generateToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Build filter object from query params
 */
const buildFilter = (query, allowedFilters) => {
  const filter = {};
  allowedFilters.forEach((field) => {
    if (query[field]) {
      if (typeof query[field] === 'string' && query[field].includes(',')) {
        filter[field] = { $in: query[field].split(',') };
      } else {
        filter[field] = query[field];
      }
    }
  });
  return filter;
};

/**
 * Build search query
 */
const buildSearchQuery = (query, searchFields) => {
  if (!query.search) return {};
  const searchRegex = { $regex: query.search, $options: 'i' };
  return {
    $or: searchFields.map((field) => ({ [field]: searchRegex })),
  };
};

/**
 * Build sort object
 */
const buildSort = (query, defaultSort = '-createdAt') => {
  if (query.sort) {
    const sortFields = query.sort.split(',').join(' ');
    return sortFields;
  }
  return defaultSort;
};

/**
 * Calculate expense split
 */
const calculateEqualSplit = (amount, participants) => {
  const share = amount / participants.length;
  return participants.map((p) => ({
    user: p,
    amount: Math.round(share * 100) / 100,
    percentage: Math.round((100 / participants.length) * 100) / 100,
  }));
};

const calculatePercentageSplit = (amount, participantsWithPercentages) => {
  return participantsWithPercentages.map((p) => ({
    user: p.user,
    amount: Math.round((amount * p.percentage) / 100 * 100) / 100,
    percentage: p.percentage,
  }));
};

const calculateCustomSplit = (amount, participantsWithAmounts) => {
  return participantsWithAmounts.map((p) => ({
    user: p.user,
    amount: p.amount,
    percentage: Math.round((p.amount / amount) * 100 * 100) / 100,
  }));
};

module.exports = {
  generateToken,
  paginate,
  buildFilter,
  buildSearchQuery,
  buildSort,
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateCustomSplit,
};
