const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

// PATHS
const configPath = path.join(__dirname, '/../../config.env');
const toursDataPath = path.join(__dirname, 'tours.json');
const usersDataPath = path.join(__dirname, 'users.json');
const reviewsDataPath = path.join(__dirname, 'reviews.json');


// DATA
const tours = JSON.parse(fs.readFileSync(toursDataPath, 'utf-8'));
const users = JSON.parse(fs.readFileSync(usersDataPath, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(reviewsDataPath, 'utf-8'));

// CONFIGURATION
dotenv.config({ path: configPath });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// WRITING DATA INTO THE DATABASE
const writeData = async (data) => {
  try {
    await Tour.create(data.tours);
    await User.create(data.users, { validateBeforeSave: false });
    await Review.create(data.reviews);
  } catch (err) {
    console.log(err);
  } finally {
    await mongoose.connection.close();
  }
};

// DELETE ALL THE PREVIOUS RECORDS
const deleteAllRecords = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
  } catch (err) {
    return err;
  } finally {
    mongoose.connection.close();
  }
};

mongoose.connect(DB, () => {
  // CHECKING THE FLAG
  if (process.argv[2] === '--delete') deleteAllRecords();
  else if (process.argv[2] === '--import') writeData({ tours, reviews, users });
  else {
    mongoose.connection.close();
  }
});
