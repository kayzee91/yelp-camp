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
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6001e704a02b9b08b4c4f486",
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url:
            "https://res.cloudinary.com/yelpcampkz/image/upload/v1610983160/YelpCamp/pexels-quang-nguyen-vinh-4268140_kb6kij.jpg",
          filename: "YelpCamp/xqdtl68vq7ikvijivztg",
        },
        {
          url:
            "https://res.cloudinary.com/yelpcampkz/image/upload/v1610983164/YelpCamp/pexels-cottonbro-6003106_f5ycun.jpg",
          filename: "YelpCamp/xqdtl68vq7ikvijivztg",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
