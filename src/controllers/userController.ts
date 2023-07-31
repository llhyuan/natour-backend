// to be implemented
import { Request, Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../models/customTypes';
import User from '../models/user';

export async function createUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route has not been defined.',
  });
}

export async function getUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route has not been defined.',
  });
}

async function _getAllUsers(req: Request, res: Response, next: NextFunction) {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users: users,
    },
  });
}

export const getAllUsers = catchAsync(_getAllUsers);

async function _updateProfile(req: Request, res: Response, next: NextFunction) {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for updating password.', 400));
  }

  // The only fields allowed to be changed by the user at the moment are:
  // name, email
  const updateObj = filterObj(req.body, 'name', 'email');
  console.log(updateObj);

  const user = await User.findByIdAndUpdate(req.body.reqUserId, updateObj, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(
      new AppError('Could not find the user profile. Try again later', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedProfile: user,
    },
  });
}

export const updateProfile = catchAsync(_updateProfile);

async function _deleteProfile(req: Request, res: Response, next: NextFunction) {
  const user = await User.findByIdAndUpdate(
    req.body.reqUserId,
    { active: false },
    { new: true, select: '+active' }
  );
  console.log(user);

  if (!user) {
    return next(new AppError('The user in question does not exist', 404));
  }

  res.status(200).json({});
}

export const deleteProfile = catchAsync(_deleteProfile);

export async function updateUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route has not been defined.',
  });
}

export async function deleteUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route has not been defined.',
  });
}

function filterObj(obj: object, ...allowedFields: string[]) {
  let filteredObj: object = {};

  for (const field of allowedFields) {
    if (!!obj[field]) {
      filteredObj[field] = obj[field];
    }
  }
  return filteredObj;
}
