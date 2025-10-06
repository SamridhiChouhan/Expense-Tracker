const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

router.get("/signup", async (req, res) => {
  res.render("user/signup");
});

router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    console.log(req.body);
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.logIn(registeredUser, (err) => {
      if (err) {
        next(err);
      }
      req.flash("success", "Welcome to MoneyMap!");
      res.render("user/tutorial");
    });
  } catch (error) {
    req.flash("failure", error.message);
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("user/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to MoneyMap! You are Logged in!");
    res.redirect("/");
  }
);

router.get("/logout", async (req, res) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/login");
  });
});

router.get("/tutorial", async (req, res) => {
  res.render("user/tutorial");
});

module.exports = router;
