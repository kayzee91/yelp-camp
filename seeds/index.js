const Campground = require("../models/campground");

//*import cities
const cities = require("./cities");

//* import name and description (destructure)
const { places, descriptors } = require("./seedHelpers");

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

//* create random in array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//*create new camp randomly
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6001e704a02b9b08b4c4f486",
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/yelpcampkz/image/upload/v1610906589/YelpCamp/xqdtl68vq7ikvijivztg.png",
          filename: "YelpCamp/xqdtl68vq7ikvijivztg",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      price,
      geometry: {
        type: "Point",
        coordinates: [-119.699375153073, 37.0743595873],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
