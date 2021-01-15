const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const Campground = require("../models/campground");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
//*import Express Error
const catchAsync = require("../utilities/catchAsync");

//*routes for review model
router.post(
  "/",
  validateReview,
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review added!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
