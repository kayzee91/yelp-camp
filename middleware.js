module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash(
      "error",
      "Sorry, you need to login first before creating campground."
    );
    return res.redirect("/login");
  }
  next();
};
