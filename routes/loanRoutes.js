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

loanRouter.get('/', isAuthenticated, getLoans);
loanRouter.get('/:id', isAuthenticated, getLoanByID);
loanRouter.post('/', isAuthenticated, createLoan);
loanRouter.patch('/:id', isAuthenticated, updateLoan);

module.exports = loanRouter;
