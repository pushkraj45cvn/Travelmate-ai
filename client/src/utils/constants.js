export const TRAVEL_TYPES = [
  { value: 'solo', label: 'Solo', icon: '🧑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends', icon: '👥' },
  { value: 'couple', label: 'Couple', icon: '💑' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'luxury', label: 'Luxury', icon: '💎' },
  { value: 'backpacking', label: 'Backpacking', icon: '🎒' },
];

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'CNY', label: 'CNY (¥)', symbol: '¥' },
  { value: 'BRL', label: 'BRL (R$)', symbol: 'R$' },
  { value: 'MXN', label: 'MXN (Mex$)', symbol: 'Mex$' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'flights', label: 'Flights', icon: '✈️', color: '#3b82f6' },
  { value: 'hotels', label: 'Hotels', icon: '🏨', color: '#8b5cf6' },
  { value: 'food', label: 'Food', icon: '🍽️', color: '#f59e0b' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { value: 'fuel', label: 'Fuel', icon: '⛽', color: '#10b981' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#06b6d4' },
  { value: 'activities', label: 'Activities', icon: '🎯', color: '#f97316' },
  { value: 'miscellaneous', label: 'Miscellaneous', icon: '📦', color: '#6b7280' },
];

export const PACKING_CATEGORIES = [
  { value: 'clothes', label: 'Clothes', icon: '👕' },
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'medicines', label: 'Medicines', icon: '💊' },
  { value: 'documents', label: 'Documents', icon: '📄' },
  { value: 'toiletries', label: 'Toiletries', icon: '🧴' },
  { value: 'accessories', label: 'Accessories', icon: '🕶️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const TRIP_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'badge-primary' },
  { value: 'ongoing', label: 'Ongoing', color: 'badge-success' },
  { value: 'completed', label: 'Completed', color: 'badge-success' },
  { value: 'cancelled', label: 'Cancelled', color: 'badge-danger' },
  { value: 'archived', label: 'Archived', color: 'badge-warning' },
];

export const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal Split' },
  { value: 'percentage', label: 'Percentage Split' },
  { value: 'custom', label: 'Custom Split' },
];

export const COLLABORATOR_ROLES = [
  { value: 'editor', label: 'Editor', description: 'Can edit trip details, itinerary, and expenses' },
  { value: 'viewer', label: 'Viewer', description: 'Can view trip details only' },
];

export const NOTIFICATION_TYPES = {
  invitation_received: { label: 'Invitation Received', icon: '📨' },
  invitation_accepted: { label: 'Invitation Accepted', icon: '✅' },
  expense_added: { label: 'Expense Added', icon: '💰' },
  trip_updated: { label: 'Trip Updated', icon: '🔄' },
  reminder: { label: 'Reminder', icon: '⏰' },
  new_message: { label: 'New Message', icon: '💬' },
  member_joined: { label: 'Member Joined', icon: '👋' },
};
