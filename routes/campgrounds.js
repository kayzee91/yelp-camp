const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");

//*import Express Error
const catchAsync = require("../utilities/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

//* routes

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//! this route is above the campground/id route so that it can work, if not the word "new" will be treated as an ID

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  validateCampground,
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully created new campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
      .populate("reviews")
      .populate("author");

    if (!campground) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

//*route for edit & update campgrounds
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      ...req.body.campground
    );
    req.flash("success", "Successfully updated campgrounds");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
