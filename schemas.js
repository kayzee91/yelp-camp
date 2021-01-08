const Joi = require("joi");

//* create schema for campground using JOI for validation
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
  }).required(),
  image: Joi.string().required(),
  location: Joi.string().required(),
  description: Joi.string().required(),
});

//* create schema for review using JOI for validation
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});
