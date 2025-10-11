const Income = require("../models/income");

module.exports.showAddIncome = (req, res) => {
  res.render("addIncome");
};

module.exports.addIncome = async (req, res) => {
  let { income_source, amount, category, id, created_at } = req.validateIncome;

  let newIncome = new Income({
    income_source,
    amount,
    category,
    id,
    created_at,
    user: req.user._id,
  });
  await newIncome.save().then((res) => {
    console.log(res);
  });
  req.flash("success", "New Income Created!");

  res.redirect("/");
};

module.exports.showEditIncome = async (req, res) => {
  let { id } = req.params;
  let income = await Income.findOne({ id });
  // console.log(income);
  if (!income) {
    throw new ExpressError(404, "Income not found!");
  }
  res.render("editIncome", { income });
};

module.exports.editIncome = async (req, res) => {
  let { id } = req.params;
  let { income_source, amount, category } = req.body;
  let income = await Income.findOneAndUpdate(
    { id },
    {
      income_source,
      amount,
      category,
    }
  );
  req.flash("success", "Income Edited Successfully!");

  res.redirect("/");
};

module.exports.deleteIncome = async (req, res) => {
  let { id } = req.params;
  let income = await Income.findOneAndDelete({ id });
  if (!income) {
    throw new ExpressError(404, "Income not found!");
  }
  console.log(income);
  req.flash("success", "Income Deleted Successfully!");
  res.redirect("/");
};

module.exports.categorywiseIncome = async (req, res) => {
  let { category } = req.query;
  let incomeCatwise = await Income.find({
    category: `${req.query.category}`,
    user: req.user._id,
  });
  let sum = 0;

  for (income of incomeCatwise) {
    sum = sum + income.amount;
  }

  const allowedCategories = [
    "Salary",
    "Freelance",
    "Gift",
    "Investment",
    "Side Hustle",
    "Sale",
    "Interest",
    "Online Income",
    "Other",
  ];

  if (category && !allowedCategories.includes(category)) {
    req.flash("failure", `No income found for this category: ${category}`);
    return res.redirect("/");
  }

  if (incomeCatwise.length == 0) {
    req.flash("failure", `No income found for this Category : ${category}`);
    return res.redirect("/");
  }

  res.render("incCategory", { incomeCatwise, sum });
};
