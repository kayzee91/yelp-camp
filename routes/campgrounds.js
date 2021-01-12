const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");

//*import Express Error
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
//*joi as validater
const { campgroundSchema, reviewSchema } = require("../schemas.js");

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

//* routes

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//! this route is above the campground/id route so that it can work, if not the word "new" will be treated as an ID
router.get("//new", (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", { campground });
  })
);

//*route for edit & update campgrounds
router.get(
  "/:id/edit",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);
router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
