const mongoose = require("mongoose");
const { Schema } = mongoose;

const incomeSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  income_source: {
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
      "Salary",
      "Freelance",
      "Gift",
      "Investment",
      "Side Hustle",
      "Sale",
      "Interest",
      "Online Income",
      "Other",
    ],
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Income = mongoose.model("Income", incomeSchema);
module.exports = Income;
