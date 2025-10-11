const Expense = require("../models/expense");
const Income = require("../models/income");

module.exports.index = async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("failure", "You must be logged in first!");
    return res.redirect("/login");
  }

  // console.log(req.session.user);
  let allExpense = await Expense.find({ user: req.user._id }).sort({
    created_at: -1,
  });
  let totalExpense = 0;
  let totalIncome = 0;
  for (expense of allExpense) {
    totalExpense = totalExpense + expense.amount;
  }

  let allIncomes = await Income.find({ user: req.user._id }).sort({
    created_at: -1,
  });
  for (income of allIncomes) {
    totalIncome = totalIncome + income.amount;
  }

  let expenseProgress = (totalExpense / totalIncome) * 100;

  const expenseResult = await Expense.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const incomeResult = await Income.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
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

  console.log(incomeChartData);

  res.render("index", {
    allExpense,
    totalExpense,
    allIncomes,
    totalIncome,
    expenseProgress,
    expenseChartData,
    incomeChartData,
  });
};

module.exports.showAddExpense = async (req, res) => {
  res.render("addExpense");
};

module.exports.addExpense = async (req, res, next) => {
  let { expense_title, amount, category, id, created_at } = req.validateExpense;

  let newExpense = new Expense({
    expense_title,
    amount,
    category,
    id,
    created_at,
    user: req.user._id,
  });

  await newExpense.save().then((res) => {
    // console.log(res);
  });

  req.flash("success", "New Expense Created!");

  res.redirect("/");
};

module.exports.showEditExpense = async (req, res) => {
  let { id } = req.params;
  let expense = await Expense.findOne({ id });
  // console.log(expense)
  if (!expense) {
    throw new ExpressError(404, "Expense not found");
  }

  res.render("editExpense", { expense });
};

module.exports.editExpense = async (req, res) => {
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
};

module.exports.deleteExpense = async (req, res) => {
  let { id } = req.params;
  let expense = await Expense.findOneAndDelete({ id });
  if (!expense) {
    throw new ExpressError(404, "Expense not found");
  }
  // console.log(expense);
  req.flash("success", "Expense Deleted Successfully!");
  res.redirect("/");
};

module.exports.categorywiseExpense = async (req, res) => {
  let { category } = req.query;
  let expenseCatwise = await Expense.find({
    category: `${req.query.category}`,
    user: req.user._id,
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
    req.flash("failure", `No Expense found for this category : ${category}`);
    return res.redirect("/");
  }

  // console.log(expenseCatwise);
  if (expenseCatwise.length == 0) {
    req.flash("failure", `No expense found for this Category : ${category}`);
    return res.redirect("/");
  }

  res.render("expCategory", { expenseCatwise, sum });
};

module.exports.monthwiseList = async (req, res) => {
  let { month } = req.query;
  let totalIncome = 0;
  let totalExpense = 0;

  let expenses = await Expense.find({ user: req.user._id }).sort({
    created_at: -1,
  });
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

  let incomes = await Income.find({ user: req.user._id }).sort({
    created_at: -1,
  });
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

  if (totalExpense === 0 && totalIncome === 0) {
    req.flash("failure", "No Expense and Income found for this month!");
    return res.redirect("/");
  }

  res.render("monthWise", {
    groupedexpense,
    expenses,
    incomes,
    groupedincome,
    totalExpense,
    totalIncome,
  });
};
