import { Request, Response, NextFunction } from 'express-serve-static-core';
import User from '../models/user';
import catchAsync from '../utils/catchAsync';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppError } from '../models/customTypes';

async function _signup(req: Request, res: Response, _next: NextFunction) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordLastChanged: new Date(req.body.passwordLastChanged),
  });

  const secret: jwt.Secret | undefined = process.env.SECRET;

  if (secret === undefined) {
    throw Error('Authentication secret missing.');
  }

  const payload = { id: newUser._id };
  const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXP });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
      token: token,
    },
  });
}

export const signup = catchAsync(_signup);

async function _login(req: Request, res: Response, next: NextFunction) {
  const email = req.body.email;
  const password = req.body.password;

  if (email === undefined || password === undefined) {
    next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email: email });
  console.log(user);

  if (
    !user ||
    !user.password ||
    !(await bcrypt.compare(password, user.password))
  ) {
    next(new AppError('Incorrect email or password.', 401));
  } else {
    const secret = process.env.SECRET;

    if (secret === undefined) {
      throw Error('Authentication secret missing.');
    }

    const payload = { id: user._id };
    const authToken = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXP,
    });

    res.status(200).json({
      status: 'success',
      data: {
        token: authToken,
      },
    });
  }
}

export const login = catchAsync(_login);

async function _verifyLoginStatus(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const secret = process.env.SECRET;

  if (secret === undefined) {
    throw Error('Authentication secret missing.');
  }

  let token: string = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const authArr = req.headers.authorization.split(' ');
    if (authArr.length > 1) {
      token = authArr[1];
    }
  }
  if (token === '') {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // if the token is invalid, an Error will be thrown
  // and will be caught by Express.

  const payload = jwt.verify(token, secret);

  // Check if the user holding the token is still in the database
  const user = await User.findById(payload['id']);
  if (!user) {
    return next(new AppError('The user does not exist.', 401));
  }

  // Check if the user has changed the password after the token was issued.
  if (
    user.passwordLastChanged &&
    payload['iat'] &&
    user.passwordLastChanged.getTime() / 1000 > payload['iat']
  ) {
    return next(
      new AppError('The login session has expired. Please login again.', 401)
    );
  }

  next();
}

export const verifyLoginStatus = catchAsync(_verifyLoginStatus);
