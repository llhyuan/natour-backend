import {
  Request,
  Response,
  NextFunction,
  CookieOptions,
} from 'express-serve-static-core';
import User from '../models/user';
import catchAsync from '../utils/catchAsync';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailjs from '@emailjs/nodejs';
import { AppError } from '../models/customTypes';
import mongoose from 'mongoose';

// Create a new user profile for the user.
async function _signup(req: Request, res: Response, _next: NextFunction) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: 'default.jpg',
    passwordLastChanged: new Date(),
  });

  const token = generateLoginToken(newUser._id);
  const cookieOptions: CookieOptions = {
    path: '/',
    httpOnly: true,
    maxAge: 10 * 24 * 60 * 60 * 1000,
    sameSite: 'none',
  };

  if (process.env.NODE_ENV !== 'development') {
    cookieOptions.secure = true;
  }

  // Send the token using cookie
  // The cookie that bearing the token will only be sent using HTTPs (httpOnly option)

  // And will only be accessible by the web server (sercure option)
  res.cookie('jwt', token, cookieOptions);

  // Hide these two fields from the user
  // .save() is not called, so these changes will not be committed to database.
  newUser.password = '';

  res.status(201).json({
    status: 'success',
    message: 'Your Account has been created.',
    data: {
      name: newUser.name,
      email: newUser.email,
    },
  });
}

export const signup = catchAsync(_signup);

// Log user in with the credentials provided by the user.
async function _login(req: Request, res: Response, next: NextFunction) {
  const email = req.body.email;
  const password = req.body.password;

  if (email === undefined || password === undefined) {
    next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email: email }).select('+password');

  if (
    !user ||
    !user.password ||
    !(await bcrypt.compare(password, user.password))
  ) {
    next(new AppError('Incorrect email or password.', 401));
  } else {
    const authToken = generateLoginToken(user._id);
    const cookieOptions: CookieOptions = {
      path: '/',
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
    };

    if (process.env.NODE_ENV !== 'development') {
      cookieOptions.secure = true;
    }

    // Send the token using cookie
    // The cookie that bearing the token will only be sent using HTTPs (httpOnly option)
    // And will only be accessible by the web server (sercure option)
    res.cookie('jwt', authToken, cookieOptions);

    // Send the token using cookie
    // The cookie that bearing the token will only be sent using HTTPs (httpOnly option)
    // And will only be accessible by the web server (sercure option)
    res.status(200).json({
      status: 'success',
      message: 'You have logged in successfuly.',
    });
  }
}

export const login = catchAsync(_login);

async function _logout(_req: Request, res: Response, _next: NextFunction) {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 10 * 1000),
    sameSite: 'none',
  });

  // Send the token using cookie
  // The cookie that bearing the token will only be sent using HTTPs (httpOnly option)
  // And will only be accessible by the web server (sercure option)
  res.status(200).json({
    status: 'success',
    message: 'Successfuly logged out.',
  });
}

export const logout = catchAsync(_logout);

async function _isLogin(req: Request, res: Response, _next: NextFunction) {
  const secret = process.env.SECRET;

  if (secret === undefined) {
    throw Error('Authentication secret missing.');
  }

  let token: string = '';

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token !== '') {
    const payload = jwt.verify(token, secret);

    // Check if the user holding the token is still in the database
    const user = await User.findById(payload['id']);

    if (
      user &&
      user.passwordLastChanged &&
      payload['iat'] &&
      parseInt(user.passwordLastChanged.getTime() / 1000 + '') < payload['iat']
    ) {
      res.status(200).json({
        status: 'success',
        data: {
          isLogin: true,
        },
      });
      return;
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      isLogin: false,
    },
  });
}

export const isLogin = catchAsync(_isLogin);

// Verify the user's login status,
// before allowing the user to perform certain actions.
// The verified user identity will be saved into the request object.
async function _verifyLoginStatus(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const secret = process.env.SECRET;

  if (secret === undefined) {
    throw Error('Authentication secret missing.');
  }

  let token: string = '';
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
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
      new AppError('You are not logged in. Please log in to get access.', 401),
    );
  }

  // if the token is invalid, an Error will be thrown
  // and will be caught by Express.

  const payload = jwt.verify(token, secret);

  // Check if the user holding the token is still in the database
  const user = await User.findById(payload['id']);
  if (!user) {
    return next(new AppError('The user does not exist.', 404));
  }

  // Check if the user has changed the password after the token was issued.
  if (
    user.passwordLastChanged &&
    payload['iat'] &&
    parseInt(user.passwordLastChanged.getTime() / 1000 + '') > payload['iat']
  ) {
    return next(
      new AppError('The login session has expired. Please login again.', 401),
    );
  }

  req.body.reqUserId = user._id;
  req.body.reqUserRole = user.role;
  next();
}

export const verifyLoginStatus = catchAsync(_verifyLoginStatus);

// Restrict a user's access, based on that user's role: 'user', 'admin', 'guide', ...
export function restrictUserRoleTo(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.body.reqUserRole)) {
      return next(
        new AppError('You donnot have permission to perform this action.', 403),
      );
    }

    next();
  };
}

// Send to token to the user to help recover forgotten password.
async function _forgetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const query: object = { email: req.body.email ?? 'empty@email.com' };

  const user = await User.findOne(query);

  if (!user) {
    return next(new AppError('Email address incorrect.', 404));
  }

  // generate a random token and send it to the user to reset the password.
  // The generated token is encoded as a hex string, and then hashed and then encoded back to a hex string.
  const resetToken: string = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetTokenGenerateTime = Date.now() + 10 * 60 * 1000; // resert token will only be valid for 10 minutes.

  await user.save({ validateBeforeSave: false });

  // Create an url that includes this random token,
  // And send it to the user to reset the password.
  const resetUrl = `https://natours-llhyuan.vercel.app/me/forget-password/${resetToken}`;

  const emailTemplateParams = {
    user_name: user.name,
    reset_url: resetUrl,
    user_email: user.email,
  };

  const pubkey = process.env.MAIL_PUBKEY ?? '';
  const prikey = process.env.MAIL_PRIKEY ?? '';

  emailjs
    .send('service_x8z98ne', 'reset_password', emailTemplateParams, {
      publicKey: pubkey,
      privateKey: prikey,
    })
    .then(
      () => {
        res.status(200).json({
          status: 'success',
          message: 'Password reset link has been sent to your email.',
        });
      },
      () => {
        user.passwordResetToken = undefined;
        user.passwordLastChanged = undefined;

        user.save({ validateBeforeSave: false });

        return next(
          new AppError(
            'There has been an error sending reset link to your email. Try again later.',
            500,
          ),
        );
      },
    );
}

export const forgetPassword = catchAsync(_forgetPassword);

// Reset the user's password.
async function _resetPassword(req: Request, res: Response, next: NextFunction) {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: resetToken,
    resetTokenGenerateTime: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return next(new AppError('The link is invalid or has expired.', 500));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  user.resetTokenGenerateTime = undefined;
  user.passwordResetToken = undefined;
  user.passwordLastChanged = new Date();

  await user.save();

  // Generate a new token to be used to verify the user's login status.
  const authToken = generateLoginToken(user._id);
  const cookieOptions: CookieOptions = {
    path: '/',
    httpOnly: true,
    maxAge: 10 * 24 * 60 * 60 * 1000,
    sameSite: 'none',
  };

  if (process.env.NODE_ENV !== 'development') {
    cookieOptions.secure = true;
  }

  // Send the token using cookie
  // The cookie that bearing the token will only be sent using HTTPs (httpOnly option)
  // And will only be accessible by the web server (sercure option)
  res.cookie('jwt', authToken, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Password has been updated.',
  });
}

export const resetPassword = catchAsync(_resetPassword);

// For logged in user to change/update their password.
// The request body should contain the user's current password, and the new password.
// And the request header should contain a login JWT.
// The user's login status will be verified, before allowing the user to update the password.
async function _updatePassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = await User.findById(req.body.reqUserId).select('+password');

  if (!user) {
    return next(new AppError("Cannot find the user's profile", 404));
  }

  if (!user.password) {
    return next(
      new AppError('Database connection failed. Try again later.', 500),
    );
  }

  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // The password and passwordConfirm in the request body are unencrypted.
  // They are assigned to the user
  // And will be encrypted by the pre save meddleware defined on the User schema when .save() is called.
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;

  await user.save();

  const token = generateLoginToken(user['_id']);
  const cookieOptions: CookieOptions = {
    path: '/',
    httpOnly: true,
    maxAge: 10 * 24 * 60 * 60 * 1000,
    sameSite: 'none',
  };

  if (process.env.NODE_ENV !== 'development') {
    cookieOptions.secure = true;
  }

  // Send the token using cookie
  // The cookie that bearing the token will only be sent using HTTPs (httpOnly option)
  // And will only be accessible by the web server (sercure option)
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Password updated',
  });
}

export const updatePassword = catchAsync(_updatePassword);

function generateLoginToken(userId: mongoose.Types.ObjectId) {
  const secret: jwt.Secret | undefined = process.env.SECRET;

  if (secret === undefined) {
    throw Error('Authentication secret missing.');
  }

  const payload = { id: userId };
  const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXP });
  return token;
}
