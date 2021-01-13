const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const Campground = require("../models/campground");
//*import Express Error
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
//*joi as validater
const { campgroundSchema, reviewSchema } = require("../schemas.js");

//* Joi middleware function
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msj = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msj, 400);
  } else {
    next();
  }
};

//*routes for review model
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review added!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
