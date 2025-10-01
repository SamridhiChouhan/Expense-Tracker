const { expenseSchema, incomeSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");
const Expense = require("./models/expense");
const { v4: uuidv4 } = require("uuid");

const validateExpense = (req, res, next) => {
  let id = uuidv4();
  let created_at = new Date();

  let result = expenseSchema.validate({ ...req.body, id, created_at });

  if (result.error) {
    let errMsg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    req.validateExpense = result.value;
    next();
  }
};

const validateIncome = (req, res, next) => {
  let id = uuidv4();
  let created_at = new Date();

  let result = incomeSchema.validate({ ...req.body, id, created_at });

  if (result.error) {
    let errMsg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    req.validateIncome = result.value;
    next();
  }
};

module.exports = { validateExpense, validateIncome };
