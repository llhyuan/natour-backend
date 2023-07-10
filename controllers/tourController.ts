import * as express from 'express';
import { TourRequest } from '../models/customTypes';
import Tour from '../models/tour';
import mongoose, { Error } from 'mongoose';
import { Query } from 'express-serve-static-core';

//const fs = require('fs');
class APIFeaturesGET {
  query: mongoose.Query<any, typeof Tour, {}>;
  queryObj: Query;

  constructor(query: mongoose.Query<any, typeof Tour, {}>, queryObj: Query) {
    this.query = query;
    this.queryObj = queryObj;
  }

  Find() {
    const queryObj = { ...this.queryObj };

    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    this.query = this.query.find(queryObj);
    return this;
  }

  Sort() {
    if (this.queryObj.sort) {
      let sortBy: string | string[] = '';
      if (typeof this.queryObj.sort === 'string') {
        sortBy = this.queryObj.sort as string;
      } else if (typeof this.queryObj.sort === 'object') {
        const queryArr = this.queryObj.sort as Array<string>;
        sortBy = queryArr.join(' ');
      }

      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  Filter() {
    // Allow users to query selected fields of a document
    if (this.queryObj.fields) {
      let filterBy: string | string[] = '';
      if (typeof this.queryObj.fields === 'string') {
        filterBy = this.queryObj.fields as string;
      } else if (typeof this.queryObj.fields === 'object') {
        const queryArr = this.queryObj.fields as Array<string>;
        filterBy = queryArr.join(' ');
      }

      this.query = this.query.select(filterBy);
    }
    return this;
  }

  Paginization() {
    /// .skip() to skip the specified number of record and
    /// .limit() to limit the number of result returned in one query.
    /// The default page number is 1, ie. the first page
    /// And will be set to the valid number user provided.
    let pageNumber: number | undefined = 1;
    if (typeof this.queryObj.page === 'string') {
      pageNumber = parseInt(this.queryObj.page) || 1;
    }

    let limit: number | undefined = 20;
    if (typeof this.queryObj.limit === 'string') {
      limit = parseInt(this.queryObj.limit) || 20;
    }

    // if the page number provided is bigger than the actual number of pages there are.
    // An error is thrown.
    const skip: number = (pageNumber - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export async function getAllTours(req: TourRequest, res: express.Response) {
  try {
    console.log(req.query);

    const getFeatures = new APIFeaturesGET(Tour.find(), req.query);

    // Build the query
    getFeatures.Find().Sort().Filter().Paginization();

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
