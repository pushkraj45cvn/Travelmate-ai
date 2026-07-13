const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

const validPlans = {
  pro: { name: 'Pro', price: 9 },
  team: { name: 'Team', price: 19 },
};

// @desc    Process subscription payment (dummy) & upgrade user plan
// @route   POST /api/subscriptions/subscribe
// @access  Private
exports.subscribe = asyncHandler(async (req, res, next) => {
  const { planId, paymentDetails } = req.body;

  if (!planId || !validPlans[planId]) {
    return next(new ErrorResponse('Invalid plan selected', 400));
  }

  if (!paymentDetails || !paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv || !paymentDetails.cardholderName) {
    return next(new ErrorResponse('Please provide complete payment details', 400));
  }

  // --- Dummy Payment Validation ---
  const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
  if (cardNumber.length !== 16 || isNaN(cardNumber)) {
    return next(new ErrorResponse('Invalid card number. Must be 16 digits.', 400));
  }
  if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiry)) {
    return next(new ErrorResponse('Invalid expiry date. Use MM/YY format.', 400));
  }
  if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
    return next(new ErrorResponse('Invalid CVV. Must be 3 or 4 digits.', 400));
  }
  if (!paymentDetails.cardholderName.trim()) {
    return next(new ErrorResponse('Cardholder name is required.', 400));
  }

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate random failure for testing (10% chance)
  if (Math.random() < 0.1) {
    return next(new ErrorResponse('Payment declined. Please try a different card.', 402));
  }

  // --- Update user's plan ---
  const plan = validPlans[planId];
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { plan: planId },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: `Successfully subscribed to ${plan.name} plan!`,
    data: {
      user,
      subscription: {
        planId,
        planName: plan.name,
        price: plan.price,
        subscribedAt: new Date().toISOString(),
      },
    },
  });
});

// @desc    Cancel subscription (downgrade to free)
// @route   POST /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { plan: 'free' },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Subscription cancelled. You have been downgraded to the Free plan.',
    data: user,
  });
});
