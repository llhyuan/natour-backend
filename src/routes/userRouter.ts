import {
  getUser,
  getAllUsers,
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
  restrictUserRoleTo,
} from '../controllers/authController';

const express = require('express');
const userRouter = express.Router();

userRouter.post('/signup', signup);

userRouter.route('/login').post(login);

userRouter.route('/forgot-password').post(forgotPassword);
userRouter.route('/reset-password/:token').patch(resetPassword);

// Restrict the following routes to logged in users only.
userRouter.use(verifyLoginStatus);

userRouter.route('/update-password').patch(updatePassword);
userRouter.route('/update-profile').patch(updateProfile);

// Restrict the following routes to admins only.
userRouter.use(restrictUserRoleTo('admin'));

userRouter.route('/delete-user/:id').delete(deleteUser);

userRouter.route('/').get(getAllUsers);

export default userRouter;
