const User = require("../models/user");

module.exports.showSignupForm = async (req, res) => {
  res.render("user/signup");
};

module.exports.signup = async (req, res) => {
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
};

module.exports.showLoginForm = (req, res) => {
  res.render("user/login");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to MoneyMap! You are Logged in!");
  res.redirect("/");
};

module.exports.logout = async (req, res) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/login");
  });
};

module.exports.showTutorial = async (req, res) => {
  res.render("user/tutorial");
};
