const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user");
//*joi as validater
const { campgroundSchema, reviewSchema } = require("./schemas.js");
//*connecting boilerplate using ejs-mate
const ejsMate = require("ejs-mate");
//* passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

//*connect mongoose(db connection)
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//*import Express Error
const ExpressError = require("./utilities/ExpressError");

//*database connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//* session (always place session above routes & passport)
const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 604800000, // the number need to be in milliseconds (to show 1 week , convert milliseconds in one week)
    maxAge: 604800000,
  },
};
app.use(session(sessionConfig));

//*connect flash
app.use(flash());

//*setup views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//* to parse post body
app.use(express.urlencoded({ extended: true }));

//*overidemethod
app.use(methodOverride("_method"));

//*let express know to use public folder
app.use(express.static(path.join(__dirname, "public")));

//* setup passport authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//*flash middle ware(must be above route handlers)
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//* import route handlers
const campgroundRoutes = require("./routes/campgrounds");
app.use("/campgrounds", campgroundRoutes);

const reviewRoutes = require("./routes/reviews");
app.use("/campgrounds/:id/reviews", reviewRoutes);

const userRoutes = require("./routes/users");
app.use("/", userRoutes);

//* home route
app.get("/", (req, res) => {
  res.render("Home");
});

//* Error handling if no route matches
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//* Error Handling
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
