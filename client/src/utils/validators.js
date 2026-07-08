export const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain a number';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateTripDates = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Both start and end dates are required';
  if (new Date(endDate) < new Date(startDate)) {
    return 'End date must be after start date';
  }
  return null;
};
