// to be implemented
import { Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import { AppError, UserRequest } from '../models/customTypes';
import User from '../models/user';
import { deleteByIdHandlerFactory } from './handlerFactory';
import APIFeaturesGET from '../utils/apiFeaturesGET';

export async function createUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route has not been defined.',
  });
}

async function _getUserById(req: UserRequest, res: Response) {
  const user = await User.find({ _id: req.params.id }, 'name role photo');
  if (user) {
    res.status(201).json({
      status: 'success',
      data: {
        user: user,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      data: {
        user: [],
      },
    });
  }
}

export const getUserById = catchAsync(_getUserById);

async function _getUserProfile(req: UserRequest, res: Response) {
  console.log('from userprofile route');
  console.log(req.body.reqUserId);

  const user = await User.find({ _id: req.body.reqUserId });

  if (user) {
    res.status(200).json({
      status: 'success',
      data: {
        user: user,
      },
    });
  } else {
    res.status(200).json({ status: 'fail', message: 'User not found' });
  }
}

export const getUserProfile = catchAsync(_getUserProfile);

async function _getAllUsers(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  const getFeatures = new APIFeaturesGET(User.find(), req.query);

  // Build the query
  getFeatures.find().sort().filter().paginization();

  // execute the query
  const users = await getFeatures.query;
  res.status(201).send({
    status: 'success',
    time: req.timeofRequest,
    result: users?.length,
    data: {
      tours: users,
    },
  });
}

export const getAllUsers = catchAsync(_getAllUsers);

async function _updateProfile(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for updating password.', 400));
  }

  // The only fields allowed to be changed by the user at the moment are:
  // name, email
  const updateObj = filterObj(req.body, 'name', 'email', 'photo');

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

async function _deleteProfile(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  const user = await User.findByIdAndUpdate(
    req.body.reqUserId,
    { active: false },
    { new: true, select: '+active' }
  );

  if (!user) {
    return next(new AppError('The user in question does not exist', 404));
  }

  res.status(204).json({});
}

export const deleteProfile = catchAsync(_deleteProfile);

export const deleteUser = deleteByIdHandlerFactory(User);

function filterObj(obj: object, ...allowedFields: string[]) {
  let filteredObj: object = {};

  for (const field of allowedFields) {
    if (!!obj[field]) {
      filteredObj[field] = obj[field];
    }
  }
  return filteredObj;
}

async function _getUserId(req: UserRequest, res: Response) {
  return res.status(200).json({ id: req.body.reqUserId });
}
export const getUserId = catchAsync(_getUserId);
