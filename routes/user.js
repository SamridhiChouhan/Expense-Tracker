const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

const userController = require("../controllers/user");

router.get("/signup", userController.showSignupForm);

router.post("/signup", userController.signup);

router.get("/login", userController.showLoginForm);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

router.get("/logout", userController.logout);

router.get("/tutorial", userController.showTutorial);

module.exports = router;
