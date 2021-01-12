const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const Campground = require("./models/campground");
const Review = require("./models/review");
const methodOverride = require("method-override");
//*joi as validater
const { campgroundSchema, reviewSchema } = require("./schemas.js");
//*connecting boilerplate using ejs-mate
const ejsMate = require("ejs-mate");
//*connect mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//*let express know to use public folder
app.use(express.static(path.join(__dirname, "public")));

//*database connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//*import Express Error
const catchAsync = require("./utilities/catchAsync");
const ExpressError = require("./utilities/ExpressError");

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

//*setup views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//* to parse post body
app.use(express.urlencoded({ extended: true }));

//*overidemethod
app.use(methodOverride("_method"));

//* Joi middleware function
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msj = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msj, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msj = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msj, 400);
  } else {
    next();
  }
};

//* home route
app.get("/", (req, res) => {
  res.render("Home");
});

//* import router
const campgrounds = require("./routes/campgrounds");
app.use("/campgrounds", campgrounds);

const reviews = require("./routes/reviews");
app.use("/campgrounds/:id/reviews", reviews);

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
