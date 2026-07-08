const ExpenseSplit = require('../models/ExpenseSplit');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get or calculate expense splits for a trip
// @route   GET /api/trips/:tripId/splits
// @access  Private
exports.getSplits = asyncHandler(async (req, res, next) => {
  let split = await ExpenseSplit.findOne({ trip: req.params.tripId })
    .populate('participants.user', 'name email avatar')
    .populate('settlements.from', 'name email avatar')
    .populate('settlements.to', 'name email avatar');

  if (!split) {
    // Calculate splits
    split = await calculateSplits(req.params.tripId);
  }

  res.status(200).json({
    success: true,
    data: split,
  });
});

// @desc    Calculate and update splits
// @route   POST /api/trips/:tripId/splits/calculate
// @access  Private
exports.calculateSplits = asyncHandler(async (req, res, next) => {
  const split = await calculateSplits(req.params.tripId);

  res.status(200).json({
    success: true,
    data: split,
  });
});

// @desc    Settle a debt
// @route   POST /api/trips/:tripId/splits/settle
// @access  Private
exports.settleDebt = asyncHandler(async (req, res, next) => {
  const { fromUserId, toUserId, amount } = req.body;

  let split = await ExpenseSplit.findOne({ trip: req.params.tripId });

  if (!split) {
    return next(new ErrorResponse('No split found for this trip', 404));
  }

  split.settlements.push({
    from: fromUserId,
    to: toUserId,
    amount,
    currency: split.currency,
    isSettled: true,
    settledAt: Date.now(),
  });

  // Update participant balances
  const fromParticipant = split.participants.find(
    (p) => p.user.toString() === fromUserId
  );
  const toParticipant = split.participants.find(
    (p) => p.user.toString() === toUserId
  );

  if (fromParticipant) fromParticipant.balance += amount;
  if (toParticipant) toParticipant.balance -= amount;

  await split.save();

  res.status(200).json({
    success: true,
    data: split,
  });
});

// Helper function to calculate splits
async function calculateSplits(tripId) {
  const expenses = await Expense.find({ trip: tripId });
  const trip = await Trip.findById(tripId);

  // Get all participants (owner + collaborators)
  const participants = [];
  const participantMap = new Map();

  // Add owner
  participantMap.set(trip.owner.toString(), { totalPaid: 0, totalShare: 0, balance: 0 });

  // Add collaborators
  trip.collaborators.forEach((collab) => {
    if (!participantMap.has(collab.user.toString())) {
      participantMap.set(collab.user.toString(), { totalPaid: 0, totalShare: 0, balance: 0 });
    }
  });

  let totalExpenses = 0;

  // Calculate totals
  expenses.forEach((expense) => {
    const amount = expense.amount;
    totalExpenses += amount;

    // Add to paidBy
    const payerId = expense.paidBy.toString();
    if (participantMap.has(payerId)) {
      participantMap.get(payerId).totalPaid += amount;
    }

    // Add shares based on split
    if (expense.splitAmong && expense.splitAmong.length > 0) {
      expense.splitAmong.forEach((split) => {
        const userId = split.user.toString();
        if (participantMap.has(userId)) {
          participantMap.get(userId).totalShare += split.amount;
        }
      });
    } else {
      // Equal split among all participants
      const share = amount / participantMap.size;
      participantMap.forEach((value) => {
        value.totalShare += share;
      });
    }
  });

  // Calculate balances
  participantMap.forEach((value, userId) => {
    value.balance = Math.round((value.totalPaid - value.totalShare) * 100) / 100;
    participants.push({
      user: userId,
      totalPaid: Math.round(value.totalPaid * 100) / 100,
      totalShare: Math.round(value.totalShare * 100) / 100,
      balance: value.balance,
    });
  });

  // Generate settlement suggestions
  const settlements = [];
  const sortedByBalance = [...participants].sort((a, b) => a.balance - b.balance);

  let i = 0;
  let j = sortedByBalance.length - 1;

  while (i < j) {
    const debtor = sortedByBalance[i];
    const creditor = sortedByBalance[j];
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: Math.round(amount * 100) / 100,
        isSettled: false,
      });

      debtor.balance += amount;
      creditor.balance -= amount;
    }

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (creditor.balance < 0.01) j--;
  }

  // Upsert the split document
  let split = await ExpenseSplit.findOne({ trip: tripId });

  const splitData = {
    trip: tripId,
    participants,
    settlements,
    totalExpenses,
    currency: trip.currency,
    lastCalculated: Date.now(),
  };

  if (split) {
    split = await ExpenseSplit.findOneAndUpdate({ trip: tripId }, splitData, {
      new: true,
    });
  } else {
    split = await ExpenseSplit.create(splitData);
  }

  return split;
}
