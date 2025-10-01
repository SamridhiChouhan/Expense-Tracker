const joi = require("joi");

const expenseSchema = joi.object({
  id: joi.string().required(),
  expense_title: joi.string().required(),
  amount: joi.number().required().min(1),
  category: joi.string().required(),
  created_at: joi.date().required(),
});

const incomeSchema = joi.object({
  id: joi.string().required(),
  income_source: joi.string().required(),
  amount: joi.number().required().min(1),
  category: joi.string().required(),
  created_at: joi.date().required().default(joi.date),
});

module.exports = { expenseSchema, incomeSchema };
