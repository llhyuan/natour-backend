import * as express from 'express';
import { TourRequest } from '../models/customTypes';
import Tour from '../models/tour';
import { Error } from 'mongoose';
import { ParsedUrlQueryInput } from 'querystring';

//const fs = require('fs');

export async function getAllTours(req: TourRequest, res: express.Response) {
  try {
    console.log(req.query);
    const queryObj = { ...req.query };
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    // Build the query
    let query = Tour.find(queryObj);

    // Allow users to fetch sorted result.
    if (req.query.sort) {
      let sortBy: string | string[] = '';
      if (typeof req.query.sort === 'string') {
        sortBy = req.query.sort as string;
      } else if (typeof req.query.sort === 'object') {
        const queryArr = req.query.sort as Array<string>;
        sortBy = queryArr.join(' ');
      }

      query = query.sort(sortBy);
    }

    // Allow users to query selected fields of a document
    if (req.query.fields) {
      let filterBy: string | string[] = '';
      if (typeof req.query.fields === 'string') {
        filterBy = req.query.fields as string;
      } else if (typeof req.query.fields === 'object') {
        const queryArr = req.query.fields as Array<string>;
        filterBy = queryArr.join(' ');
      }

      query = query.select(filterBy);
    }

    // Paginization
    /// .skip() to skip the specified number of record and
    /// .limit() to limit the number of result returned in one query.
    /// The default page number is 1, ie. the first page
    /// And will be set to the valid number user provided.
    let pageNumber: number | undefined = 1;
    if (typeof req.query.page === 'string') {
      pageNumber = parseInt(req.query.page) || 1;
    }

    let limit: number | undefined = 20;
    if (typeof req.query.limit === 'string') {
      limit = parseInt(req.query.limit) || 20;
    }

    // if the page number provided is bigger than the actual number of pages there are.
    // An error is thrown.
    const skip: number = (pageNumber - 1) * limit;
    if (skip >= (await Tour.countDocuments())) {
      throw new Error('Page not found.');
    }

    query = query.skip((pageNumber - 1) * limit).limit(limit);

    // execute the query
    const tours = await query;
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
