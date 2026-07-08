const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/auth');
const { createExpenseValidator } = require('../validators/expense');
const { validate } = require('../validators/index');

router.get('/summary', protect, getExpenseSummary);
router.route('/')
  .post(protect, createExpenseValidator, validate, createExpense)
  .get(protect, getExpenses);

router.route('/:id')
  .get(protect, getExpense)
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
