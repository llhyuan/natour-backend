import mongoose from 'mongoose';
import { isEmail } from 'validator';

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
    validate: [isEmail, 'Please provide a valid email address'],
    lowercase: true,
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
      message: 'Passwords are not the same.',
    },
  },
});

const User = mongoose.model('User', userSchema);

export default User;
