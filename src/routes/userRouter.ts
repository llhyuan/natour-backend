import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { signup } from '../controllers/authController';

const express = require('express');
const userRouter = express.Router();

userRouter.route('/signup').post(signup);

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
