const express = require("express");
const Expense = require("../models/expense");
const router = express.Router();
const Income = require("../models/income");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateExpense, validateIncome } = require("../middleware.js");

// home route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    let allExpense = await Expense.find({}).sort({ created_at: -1 });
    let totalExpense = 0;
    let totalIncome = 0;
    for (expense of allExpense) {
      totalExpense = totalExpense + expense.amount;
    }

    let allIncomes = await Income.find({}).sort({ created_at: -1 });
    for (income of allIncomes) {
      totalIncome = totalIncome + income.amount;
    }

    let expenseProgress = (totalExpense / totalIncome) * 100;

    const expenseResult = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const incomeResult = await Income.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // convert to chartData format
    const expenseChartData = expenseResult.map((item) => ({
      name: item._id,
      value: item.total,
    }));

    const incomeChartData = incomeResult.map((item) => ({
      name: item._id,
      value: item.total,
    }));

    res.render("index", {
      allExpense,
      totalExpense,
      allIncomes,
      totalIncome,
      expenseProgress,
      expenseChartData,
      incomeChartData,
    });
  })
);

router.get("/addExpense", async (req, res) => {
  res.render("addExpense");
});

// create expense
router.post(
  "/addExpense",
  validateExpense,
  wrapAsync(async (req, res, next) => {
    let { expense_title, amount, category, id, created_at } =
      req.validateExpense;

    let newExpense = new Expense({
      expense_title,
      amount,
      category,
      id,
      created_at,
    });

    await newExpense.save().then((res) => {
      // console.log(res);
    });

    req.flash("success", "New Expense Created!");

    res.redirect("/");
  })
);

router.get("/editExpense/:id", async (req, res) => {
  let { id } = req.params;
  let expense = await Expense.findOne({ id });
  // console.log(expense)
  if (!expense) {
    throw new ExpressError(404, "Expense not found");
  }

  res.render("editExpense", { expense });
});

// edit expense
router.patch(
  "/editExpense/:id",
  validateExpense,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { expense_title, amount, category } = req.body;
    let expense = await Expense.findOneAndUpdate(
      { id },
      {
        expense_title,
        amount,
        category,
      }
    );
    req.flash("success", "Expense Edited Successfully!");

    res.redirect("/");
  })
);

// delete expense
router.delete(
  "/deleteExpense/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let expense = await Expense.findOneAndDelete({ id });
    if (!expense) {
      throw new ExpressError(404, "Expense not found");
    }
    // console.log(expense);
    req.flash("success", "Expense Deleted Successfully!");
    res.redirect("/");
  })
);

router.get("/expense", async (req, res) => {
  let { category } = req.query;
  let expenseCatwise = await Expense.find({
    category: `${req.query.category}`,
  }).sort({ created_at: -1 });

  let sum = 0;

  for (expense of expenseCatwise) {
    sum = sum + expense.amount;
  }

  const allowedCategories = [
    "Electricity",
    "Rent",
    "Grocery",
    "Travel",
    "Food",
    "Medicine",
    "Home",
    "Other",
  ];

  if (category && !allowedCategories.includes(category)) {
    req.flash("failure", `Invalid category: ${category}`);
    return res.redirect("/");
  }

  // console.log(expenseCatwise);
  if (expenseCatwise.length == 0) {
    req.flash("failure", `No expense found for this Category : ${category}`);
    return res.redirect("/");
  }

  res.render("expCategory", { expenseCatwise, sum });
});

router.get("/monthWise", async (req, res) => {
  let { month } = req.query;
  let totalIncome = 0;
  let totalExpense = 0;

  let expenses = await Expense.find({}).sort({ created_at: -1 });
  let groupedexpense = [];
  for (exp of expenses) {
    let expMonth = exp.created_at.toString().slice(4, 7);
    if (expMonth === req.query.month) {
      groupedexpense.push(exp);
    }
  }
  for (exp of groupedexpense) {
    totalExpense = exp.amount + totalExpense;
  }

  let incomes = await Income.find({}).sort({ created_at: -1 });
  let groupedincome = [];
  for (inc of incomes) {
    let incMonth = inc.created_at.toString().slice(4, 7);
    if (incMonth === req.query.month) {
      groupedincome.push(inc);
    }
  }
  for (inc of groupedincome) {
    totalIncome = inc.amount + totalIncome;
  }

  res.render("monthWise", {
    groupedexpense,
    expenses,
    incomes,
    groupedincome,
    totalExpense,
    totalIncome,
  });
});

module.exports = router;
