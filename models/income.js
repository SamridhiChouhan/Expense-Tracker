const mongoose = require('mongoose');
const { Schema } = mongoose;

const incomeSchema = new Schema({
   id : {
      type : String,
   },
   income_source : {
      type : String ,
   },
   amount : {
      type : Number,
   },
   category : {
      enum : ["Salary", "Freelance", "Gift", "Investment", "Side Hustle", "Sale", "Interest", "Online Income" , "Other"]
   },
   created_at : {
      type : Date ,
   }
});

const Income = mongoose.model("Income" , incomeSchema);
module.exports = Income ;
