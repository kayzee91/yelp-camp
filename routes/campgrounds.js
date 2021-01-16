const express = require("express");
const router = express.Router({ mergeParams: true });
const campgrounds = require("../controllers/campgrounds");

//*import Express Error
const catchAsync = require("../utilities/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

//* routes

router.get("/", catchAsync(campgrounds.index));

//! this route is above the campground/id route so that it can work, if not the word "new" will be treated as an ID

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.post("/", validateCampground, isLoggedIn, catchAsync(campgrounds.createCampground));

router.get("/:id", catchAsync(campgrounds.showCampground));

//*route for edit & update campgrounds
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
