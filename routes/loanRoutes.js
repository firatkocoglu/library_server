const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.js');
const {
  getLoans,
  getLoanByID,
  createLoan,
  updateLoan,
  deleteLoan,
} = require('../controllers/loans.js');

const loanRouter = Router();

module.exports = loanRouter;
