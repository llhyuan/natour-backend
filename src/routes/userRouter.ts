import {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  updateProfile,
  deleteProfile,
} from '../controllers/userController';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyLoginStatus,
  updatePassword,
} from '../controllers/authController';

const express = require('express');
const userRouter = express.Router();

userRouter.post('/signup', signup);

userRouter.route('/login').post(login);

userRouter.route('/forgot-password').post(forgotPassword);
userRouter.route('/reset-password/:token').patch(resetPassword);
userRouter.route('/update-password').patch(verifyLoginStatus, updatePassword);
userRouter.route('/update-profile').patch(verifyLoginStatus, updateProfile);
userRouter.route('/delete-profile').delete(verifyLoginStatus, deleteProfile);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
userRouter.route('/').get(getAllUsers);

export default userRouter;
