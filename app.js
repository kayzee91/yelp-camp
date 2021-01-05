const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
//*joi as validater
const { campgroundSchema } = require("./schemas.js");
//*connecting boilerplate using ejs-mate
const ejsMate = require("ejs-mate");
//*connect mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

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

//* route
app.get("/", (req, res) => {
  res.render("Home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//! this route is above the campground/id route so that it can work, if not the word "new" will be treated as an ID
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
  })
);

//*route for edit & update campgrounds
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

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
