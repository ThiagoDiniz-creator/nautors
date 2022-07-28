const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Tour = require('../../models/tourModel');

// PATHS
const configPath = path.join(__dirname, '/../../config.env');
const toursSimplePath = path.join(__dirname, 'tours-simple.json');

// DATA
const tours = JSON.parse(fs.readFileSync(toursSimplePath, 'utf-8'));

// CONFIGURATION
dotenv.config({ path: configPath });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, () => {
  console.log('The server is connected to MongoDB.');
});

// WRITING DATA INTO THE DATABASE
const writeData = async (data) => {
  try {
    await Tour.create(data);
    console.log('The tours were imported sucessfully!');
  } catch (err) {
    console.log(err);
  } finally {
    console.log('Closing connection to MongoDB.');
    mongoose.connection.close();
  }
};

// DELETE ALL THE PREVIOUS RECORDS
const deleteAllRecords = async () => {
  try {
    await Tour.deleteMany();
    console.log('Deleted all records sucessfully!');
  } catch (err) {
    return err;
  } finally {
    console.log('Closing connection to MongoDB.');
    mongoose.connection.close();
  }
};

// CHECKING THE FLAG
if (process.argv[2] === '--delete') deleteAllRecords();
else if (process.argv[2] === '--import') writeData(tours);
else {
  mongoose.connection.close();
  console.log('Closing connection to MongoDB.');
}
