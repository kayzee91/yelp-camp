const express = require("express");
const router = express.Router({ mergeParams: true });
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utilities/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

//! this route is above the campground/id route so that it can work, if not the word "new" will be treated as an ID
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
