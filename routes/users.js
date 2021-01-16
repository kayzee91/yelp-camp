const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utilities/catchAsync");
const passport = require("passport");
const users = require("../controllers/users");

router.get("/register", users.renderRegister);

router.post("/register", catchAsync(users.register));

router.get("/login", users.renderLogin);

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "./login",
  }),
  users.login
);

router.get("/logout", users.loggedOutUser);

module.exports = router;
