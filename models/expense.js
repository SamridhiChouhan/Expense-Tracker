
const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new Schema({
   id : {
      type : String,
   },
   expense_title : {
      type : String ,
   },
   amount : {
      type : Number,
   },
   category : {
      type : String ,
      enum : ["Electricity", "Rent" , "Grocery" , "Travel" , "Food" , "Medicine" , "Home" , "Other"]
   },
   created_at : {
      type : Date ,
      default : Date.now ,
   }
});

const Expense = mongoose.model("Expense" , expenseSchema);
module.exports = Expense ;
