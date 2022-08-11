// MODULES
const mongoose = require('mongoose');
const validatorPackage = require('validator');

// SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name!'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email!'],
      unique: true,
      trim: true,
      validate: [
        validatorPackage.isEmail,
        'You sent an invalid email! Try again with a valid one!',
      ],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minLength: [8, 'Please provide a password longer than seven characters!'],
      validate: [
        function (value) {
          return value === this.passwordConfirm;
        },
        'Please assert that the password and the confirmation password are both equal!',
      ],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
      minLength: [8, 'Please provide a password longer than seven characters!'],
      validate: [
        function (value) {
          return value === this.passwordConfirm;
        },
        'Please assert that the password and the confirmation password are both equal!',
      ],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);

// MODEL
const User = new mongoose.Model(userSchema);

// EXPORTING
module.exports = User;
