import { getUser, updateUser, deleteUser } from '../controllers/userController';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';

const express = require('express');
const userRouter = express.Router();

userRouter.post('/signup', signup);

userRouter.route('/login').post(login);

userRouter.route('/forgot-password').post(forgotPassword);
userRouter.route('/reset-password/:token').patch(resetPassword);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
