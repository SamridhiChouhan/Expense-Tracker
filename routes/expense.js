const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateExpense } = require("../middleware.js");

const expenseController = require("../controllers/expense.js");

// home route
router.get("/", wrapAsync(expenseController.index));

router.get("/addExpense", expenseController.showAddExpense);

// create expense
router.post(
  "/addExpense",
  validateExpense,
  wrapAsync(expenseController.addExpense)
);

router.get("/editExpense/:id", expenseController.showEditExpense);

// edit expense
router.patch(
  "/editExpense/:id",
  validateExpense,
  wrapAsync(expenseController.editExpense)
);

// delete expense
router.delete("/deleteExpense/:id", wrapAsync(expenseController.deleteExpense));

router.get("/expense", expenseController.categorywiseExpense);

router.get("/monthWise", expenseController.monthwiseList);

module.exports = router;
