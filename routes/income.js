const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateIncome } = require("../middleware.js");

const incomeController = require("../controllers/income.js");

router.get("/addIncome", incomeController.showAddIncome);

// create new income
router.post(
  "/addIncome",
  validateIncome,
  wrapAsync(incomeController.addIncome)
);

router.get("/editIncome/:id", incomeController.showEditIncome);

// edit income
router.patch(
  "/editIncome/:id",
  validateIncome,
  wrapAsync(incomeController.editIncome)
);

// delete income
router.delete("/deleteIncome/:id", wrapAsync(incomeController.deleteIncome));

router.get("/income", incomeController.categorywiseIncome);

module.exports = router;
