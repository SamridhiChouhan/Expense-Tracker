const express = require("express");
// const Income = require("../models/income.js");
const router = express.Router();
const Income = require("../models/income");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateExpense, validateIncome } = require("../middleware.js");

router.get("/addIncome", (req, res) => {
  res.render("addIncome");
});

// create new income
router.post(
  "/addIncome",
  validateIncome,
  wrapAsync(async (req, res) => {
    let { income_source, amount, category, id, created_at } =
      req.validateIncome;

    let newIncome = new Income({
      income_source,
      amount,
      category,
      id,
      created_at,
    });
    await newIncome.save().then((res) => {
      console.log(res);
    });
    req.flash("success", "New Income Created!");

    res.redirect("/");
  })
);

router.get("/editIncome/:id", async (req, res) => {
  let { id } = req.params;
  let income = await Income.findOne({ id });
  // console.log(income);
  if (!income) {
    throw new ExpressError(404, "Income not found");
  }
  res.render("editIncome", { income });
});

// edit income
router.patch(
  "/editIncome/:id",
  validateIncome,
  wrapAsync(async (req, res) => {
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
  })
);

// delete income
router.delete(
  "/deleteIncome/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let income = await Income.findOneAndDelete({ id });
    if (!income) {
      throw new ExpressError(404, "Income not found");
    }
    console.log(income);
    req.flash("success", "Income Deleted Successfully!");
    res.redirect("/");
  })
);

router.get("/income", async (req, res) => {
  let { category } = req.query;
  let incomeCatwise = await Income.find({ category: `${req.query.category}` });
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
    req.flash("failure", `Invalid category: ${category}`);
    return res.redirect("/");
  }

  if (incomeCatwise.length == 0) {
    req.flash("failure", `No income found for this Category : ${category}`);
    return res.redirect("/");
  }

  res.render("incCategory", { incomeCatwise, sum });
});

module.exports = router;
