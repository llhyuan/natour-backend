import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { error } from 'console';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    maxLength: 40,
  },
  email: {
    type: String,
    required: [true, 'Place provide an email address'],
    unique: true,
    maxLength: 40,
    validate: [validator.isEmail, 'Please provide a valid email address'],
    lowercase: true,
    select: false,
  },
  photo: {
    type: String,
    maxLength: 100,
  },
  password: {
    type: String,
    required: [true, 'Please create a password'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm a password'],
    minLength: 8,
    validate: {
      validator: function (el: string) {
        return el === this['password'];
      },
      message: 'The two passwords do not match.',
    },
    select: false,
  },
  passwordLastChanged: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  resetTokenGenerateTime: Number,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password === undefined) {
    const err = new error('Password is undefind.');
    return next(err);
  }

  this.password = await bcrypt.hash(this.password, 12);

  // validate() and its pre and post hooks are called before any pre("save") hooks.
  // By the time when this middleware runs,
  // Data validation has already been done - the two passwords are the same.
  // Thus, it's safe to get rid of the passwordConfirm field.
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
