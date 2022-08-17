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
      // Trimming means the space before and after the
      // string will be removed.
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email!'],
      // Unique is a MongoDB specification, that will make
      // this field an index.
      unique: true,
      trim: true,
      validate: [
        // Using the validatorPackage to check if the email
        // field was filled with an existent type of email.
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
      // minLength forbids the length of a string to be smaller
      // than the defined here.
      minLength: [8, 'Please provide a password longer than seven characters!'],
      // select is a property that defines if in a query this field
      // will be returned. If it's false, this field will not be
      // shown in queries, if not selected back in the query.
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
    passwordChangedAt: Date,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
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

  next();
});

// METHODS
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (timestamp) {
  if (this.passwordChangedAt) {
    const changedMilli = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedMilli, timestamp);
    return changedMilli > timestamp;
  }
  return false;
};

// MODEL
const User = new mongoose.model('User', userSchema);

// EXPORTING
module.exports = User;
