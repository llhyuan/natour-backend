import * as express from 'express';
import { TourRequest } from '../models/customTypes';
import Tour from '../models/tour';

//const fs = require('fs');

export async function getAllTours(req: TourRequest, res: express.Response) {
  try {
    const queryObj = { ...req.query };
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    // Build the query
    let query = Tour.find(queryObj);

    let sortBy: string | string[] = '';
    if (req.query.sort) {
      if (typeof req.query.sort === 'string') {
        sortBy = req.query.sort as string;
      } else if (typeof req.query.sort === 'object') {
        const queryArr = req.query.sort as Array<string>;
        sortBy = queryArr.join(' ');
      }

      query = query.sort(sortBy);
    }

    // execute the query
    const tours = await query;
    res.status(200).send({
      status: 'succesy',
      time: req.timeofRequest,
      result: tours?.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Failed',
      message: err,
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
