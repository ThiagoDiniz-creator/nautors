// MODULES
const mongoose = require('mongoose');
const validatorPackage = require('validator');
const bcrypt = require('bcrypt');

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
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
      minLength: [8, 'Please provide a password longer than seven characters!'],
      validate: [
        // This works only with save. If the context option, and the run validators options are not
        // set in the update processes.
        function (value) {
          return this.password === value;
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

// MIDDLEWARES
userSchema.pre('save', async function (next, value) {
  // Only run this function if the password was actually modified
  if (!this.isModified('password')) return next();
  // Encrypting the password.
  this.password = await bcrypt.hash(this.password, 12);

  // Setting a field to undefined makes the field not persist in the Database anymore.
  // briefly, the passwordConfirm field will be deleted.
  this.passwordConfirm = undefined;
});

// METHODS
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// MODEL
const User = new mongoose.model('User', userSchema);

// EXPORTING
module.exports = User;
