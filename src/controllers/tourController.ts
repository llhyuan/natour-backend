import { TourRequest } from '../models/customTypes';
import Tour from '../models/tour';
import { Error } from 'mongoose';
import APIFeaturesGET from '../utils/apiFeaturesGET';
import { Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';

async function _getAllTours(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const getFeatures = new APIFeaturesGET(Tour.find(), req.query);

  // Build the query
  getFeatures.find().sort().filter().paginization();

  // execute the query
  const tours = await getFeatures.query;
  res.status(200).send({
    status: 'success',
    time: req.timeofRequest,
    result: tours?.length,
    data: {
      tours: tours,
    },
  });
}

export const getAllTours = catchAsync(_getAllTours);

async function _getTourById(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id;

  const result = await Tour.findOne({ _id: id });

  if (!result) {
    const err = new Error('Cannot found the queried tour.');
    throw err;
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: result,
    },
  });
}

export const getTourById = catchAsync(_getTourById);

async function _createNewTour(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
}

export const createNewTour = catchAsync(_createNewTour);

async function _modifyTour(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id;

  const modifiedTour = await Tour.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!modifiedTour) {
    throw new Error('Cannot update. try again later.');
  }

  res.status(202).json({
    status: 'success',
    data: {
      data: modifiedTour,
    },
  });
}

export const modifyTour = catchAsync(_modifyTour);

async function _deleteTour(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id;

  await Tour.findOneAndDelete({ _id: id });

  // Successful delete operaton does not return anything.
  res.status(204).json({
    status: 'success',
    data: null,
  });
}

export const deleteTour = catchAsync(_deleteTour);

export function topFiveQuery(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  req.query.sort = ['price', '-ratingsAverage'];
  req.query.fields = [
    'name',
    'duration',
    'difficulty',
    'ratingsAverage',
    'price',
  ];
  req.query.page = '1';
  req.query.limit = '5';
  console.log('From top 5 query middleware.');

  next();
}

async function _getTourStats(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
}

export const getTourStats = catchAsync(_getTourStats);

async function _getMonthlyData(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  let year: number = parseInt(req.params.year);
  if (isNaN(year)) {
    const thisYear = new Date();
    year = thisYear.getFullYear();
  }

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      tour: plan,
    },
  });
}

export const getMonthlyData = catchAsync(_getMonthlyData);
