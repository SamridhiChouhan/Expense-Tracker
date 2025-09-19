const express = require("express");
let app = express();
const port = 2020;
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require('mongoose');
const Expense = require ("./models/expense");
const Income = require ("./models/income")


app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

app.set("view engine" , "ejs");

app.engine("ejs" , ejsMate);
app.use(express.static("views"));


app.use(express.static(path.join(__dirname, "public")));

const dbUrl = "mongodb://127.0.0.1:27017/transaction"
async function main() {
  await mongoose.connect(dbUrl);
}

main()
   .then((res) =>{
       console.log(res,"connection successfull");
       })
   .catch((err) => console.log(err));



app.get("/" , async(req,res)=>{
    let allExpense = await Expense.find({});
    let totalExpense = 0 ;
    let totalIncome = 0 ;
    for(expense of allExpense){
        totalExpense = totalExpense + expense.amount ;
    }

    let allIncomes = await Income.find({});
    for(income of allIncomes){
       totalIncome = totalIncome + income.amount ;  
    }
    
    console.log(`sum of all expenses : ${totalExpense}`);
    console.log(`Total income : ${totalIncome}`)
    res.render("index" , {allExpense, totalExpense , allIncomes , totalIncome});

    
})

app.get("/upgrade" , async(req,res)=>{
    res.render("upgrade");
})

app.post("/upgrade" ,async(req,res)=>{
    let {expense_title, amount , category} = req.body ;
    let id = uuidv4();
    let created_at = new Date();
    console.log(req.body,id,created_at);
    
    let newExpense = new Expense ({expense_title , amount , category ,id , created_at});
    await newExpense.save().then((res)=>{
        console.log(res);
    })

    res.redirect('/');

})

app.get("/addIncome", (req,res)=>{
    res.render("addIncome");
})

app.post("/addIncome" ,async(req,res)=>{
    let {income_source, amount , category} = req.body ;
    let id = uuidv4();
    let created_at = new Date();
    console.log(req.body,id,created_at);
    
    let newIncome = new Income ({income_source , amount , category ,id , created_at});
    await newIncome.save().then((res)=>{
        console.log(res);
    })

    res.redirect('/');

})

app.listen(port , ()=>{
    console.log(`Server is listening on ${port}`);
})