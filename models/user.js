const mongoose = require("mongoose");
const { Schema } = mongoose;
const Expense = require("./expense");
const Income = require("./income");

const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  // expenses: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: "Expense",
  //   },
  // ],
  // incomes: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: "Income",
  //   },
  // ],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

// ref:
// -expenses
// -incomes
