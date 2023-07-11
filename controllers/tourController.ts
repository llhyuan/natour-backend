import * as express from 'express';
import { TourRequest } from '../models/customTypes';
import Tour from '../models/tour';
import mongoose, { Error } from 'mongoose';
import APIFeaturesGET from '../utils/apiFeaturesGET';

export async function getAllTours(req: TourRequest, res: express.Response) {
  try {
    console.log(req.query);

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
  } catch (err) {
    let Err: Error = err as Error;
    res.status(404).json({
      status: 'Failed',
      message: Err.toString(),
    });
  }
}

export async function getTourById(req: TourRequest, res: express.Response) {
  const id = parseInt(req.params.id);

  try {
    const result = await Tour.findOne({ id: id });

    if (!result) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'Cannot found the queried tour.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: result,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad request. Try again later.',
      message: err,
    });
  }
}

export async function createNewTour(req: TourRequest, res: express.Response) {
  try {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
}

export async function modifyTour(req: TourRequest, res: express.Response) {
  const id = parseInt(req.params.id);

  try {
    const modifiedTour = await Tour.findOneAndUpdate({ id: id }, req.body, {
      new: true,
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
  } catch (err) {
    res.status(400).json({
      status: 'Update failed',
      message: err,
    });
  }

  // modify functioin to be implemented
}

export async function deleteTour(req: TourRequest, res: express.Response) {
  const id = parseInt(req.params.id);
  console.log(id);

  try {
    await Tour.findOneAndDelete({ id: id });

    // Successful delete operaton does not return anything.
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
}

export function topFiveQuery(
  req: TourRequest,
  res: express.Response,
  next: express.NextFunction
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

export async function getTourStats(req: TourRequest, res: express.Response) {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
}

export async function getMonthlyData(req: TourRequest, res: express.Response) {
  let year: number = parseInt(req.params.year);
  if (isNaN(year)) {
    const thisYear = new Date();
    year = thisYear.getFullYear();
  }

  try {
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
      {
        $sort: {
          numTours: -1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        tour: plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
}
