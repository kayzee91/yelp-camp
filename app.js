if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo")(session);
//*joi as validater
const { campgroundSchema, reviewSchema } = require("./schemas.js");
//*connecting boilerplate using ejs-mate
const ejsMate = require("ejs-mate");
//* passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

//*connect mongoose(db connection)

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const mongoose = require("mongoose");
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//* import route handlers
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

//*import Express Error
const ExpressError = require("./utilities/ExpressError");

//*database connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//* session (always place session above routes & passport)
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const store = new MongoStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 3600,
});
store.on("error", function (err) {
  console.log("Session store error", err);
});
const sessionConfig = {
  store,
  name: "ids",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, //* to allow only https user can access our website
    expires: Date.now() + 604800000, // the number need to be in milliseconds (to show 1 week , convert milliseconds in one week)
    maxAge: 604800000,
  },
};
app.use(session(sessionConfig));

//*connect flash
app.use(flash());

//* helmet

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/yelpcampkz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//*setup views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//* to parse post body
app.use(express.urlencoded({ extended: true }));

//*overidemethod
app.use(methodOverride("_method"));

//*mongo-sanitize
app.use(mongoSanitize());

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
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
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
  console.log(`App listening at ${port}`);
});
