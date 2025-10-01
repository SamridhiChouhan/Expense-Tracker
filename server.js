const express = require("express");
let app = express();
const port = 2020;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Expense = require("./models/expense");
const Income = require("./models/income");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { validateExpense, validateIncome } = require("./middleware.js");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

app.engine("ejs", ejsMate);
app.use(express.static("views"));

app.use(express.static(path.join(__dirname, "public")));

const dbUrl = "mongodb://127.0.0.1:27017/transaction";
async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then((res) => {
    console.log(res, "connection successfull");
  })
  .catch((err) => console.log(err));

// sample pie chart data
// const chartData = [
//   { name: , value: 400 },
//   { name: "Group B", value: 300 },
//   { name: "Group C", value: 300 },
//   { name: "Group D", value: 200 }
// ];

// home route
app.get(
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

app.get("/addExpense", async (req, res) => {
  res.render("addExpense");
});

// create expense
app.post(
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

    res.redirect("/");
  })
);

app.get("/addIncome", (req, res) => {
  res.render("addIncome");
});

// create new income
app.post(
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

    res.redirect("/");
  })
);

app.get("/editExpense/:id", async (req, res) => {
  let { id } = req.params;
  let expense = await Expense.findOne({ id });
  // console.log(expense)
  res.render("editExpense", { expense });
});

// edit expense
app.patch(
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
    if (!expense) {
      return res.status(404).send("expense not found");
    }
    console.log(req.body);
    console.log(expense);
    res.redirect("/");
  })
);

app.get("/editIncome/:id", async (req, res) => {
  let { id } = req.params;
  let income = await Income.findOne({ id });
  console.log(income);
  res.render("editIncome", { income });
});

// edit income
app.patch(
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
    if (!income) {
      return res.status(404).send("income not found");
    }
    console.log(req.body);
    console.log(income);
    res.redirect("/");
  })
);

// delete expense
app.delete(
  "/deleteExpense/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let expense = await Expense.findOneAndDelete({ id });
    console.log(expense);
    res.redirect("/");
  })
);

// delete income
app.delete(
  "/deleteIncome/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let income = await Income.findOneAndDelete({ id });
    console.log(income);
    res.redirect("/");
  })
);

app.get("/expense", async (req, res) => {
  let { category } = req.query;
  let expenseCatwise = await Expense.find({
    category: `${req.query.category}`,
  }).sort({ created_at: -1 });

  let sum = 0;

  for (expense of expenseCatwise) {
    sum = sum + expense.amount;
  }

  res.render("expCategory", { expenseCatwise, sum });
});

app.get("/income", async (req, res) => {
  let { category } = req.query;
  let incomeCatwise = await Income.find({ category: `${req.query.category}` });
  // console.log(allIncomes)

  let sum = 0;

  for (income of incomeCatwise) {
    sum = sum + income.amount;
  }

  res.render("incCategory", { incomeCatwise, sum });
});

app.get("/monthWise", async (req, res) => {
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

// app.all("/*", (req, res, next) => {
//   next(new ExpressError(404, "Page not found"));
// });
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { message });
});

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
