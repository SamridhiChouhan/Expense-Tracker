const mongoose = require("mongoose");
const { Schema } = mongoose;

const expenseSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  expense_title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Electricity",
      "Rent",
      "Grocery",
      "Travel",
      "Food",
      "Medicine",
      "Home",
      "Other",
    ],
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
