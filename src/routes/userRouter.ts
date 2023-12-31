import {
  getUserById,
  getUserId,
  getAllUsers,
  deleteUser,
  updateProfile,
  getUserProfile,
} from '../controllers/userController';
import {
  signup,
  login,
  forgetPassword,
  resetPassword,
  verifyLoginStatus,
  updatePassword,
  restrictUserRoleTo,
  isLogin,
  logout,
} from '../controllers/authController';
import { getReviewsByUser } from '../controllers/reviewController';

const express = require('express');
const userRouter = express.Router();

userRouter.post('/signup', signup);

userRouter.get('/fetchId', verifyLoginStatus, getUserId);

userRouter.route('/login').post(login).get(isLogin);
userRouter.route('/logout').get(logout);

userRouter.route('/forget-password').post(forgetPassword);
userRouter.route('/reset-password/:token').patch(resetPassword);

// Restrict the following routes to logged in users only.

userRouter.route('/me').get(verifyLoginStatus, getUserProfile);
userRouter
  .route('/me/update-password')
  .patch(verifyLoginStatus, updatePassword);
userRouter.route('/me/update-profile').patch(verifyLoginStatus, updateProfile);
userRouter.route('/me/reviews').get(verifyLoginStatus, getReviewsByUser);

// Restrict the following routes to admins only.

userRouter
  .route('/delete-user/:id')
  .delete(verifyLoginStatus, restrictUserRoleTo('admin'), deleteUser);
userRouter.route('/:id').get(getUserById);

userRouter
  .route('/')
  .get(verifyLoginStatus, restrictUserRoleTo('admin'), getAllUsers);

export default userRouter;
