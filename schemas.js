const Joi = require("joi");

//* create schema using JOI for validation
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
  }).required(),
  image: Joi.string().required(),
  location: Joi.string().required(),
  description: Joi.string().required(),
});
