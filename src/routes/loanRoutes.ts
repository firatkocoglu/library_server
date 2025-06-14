const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.ts');
const {
  getLoans,
  getLoanByID,
  createLoan,
  updateLoan,
  deleteLoan,
} = require('../controllers/loans.ts');

const loanRouter = Router();

loanRouter.get('/', isAuthenticated, getLoans);
loanRouter.get('/:id', isAuthenticated, getLoanByID);
loanRouter.post('/', isAuthenticated, createLoan);
loanRouter.patch('/:id', isAuthenticated, updateLoan);
loanRouter.delete('/:id', isAuthenticated, deleteLoan);

module.exports = loanRouter;
