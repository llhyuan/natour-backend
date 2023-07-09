import * as express from 'express';
import { collections } from '../services/database.service';
import Tour from '../models/tour';
import { TourRequest } from '../models/customTypes';
import { Collection, Error } from 'mongoose';
import { error } from 'console';
import { isString } from 'util';

//const fs = require('fs');
//const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

exports.getAllTours = async (req: TourRequest, res: express.Response) => {
  console.log(req.timeofRequest);

  try {
    const tours = await collections.tour?.find({}).toArray();

    res.status(200).send({
      status: 'success',
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
};

exports.getTourById = async (req: TourRequest, res: express.Response) => {
  const id = parseInt(req.params.id);

  try {
    const result = await collections.tour?.findOne({ tour_id: id });
    console.log(result);

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
};

exports.createNewTour = async (req: TourRequest, res: express.Response) => {
  // Request method should be POST.
  // create a new tour and commit it to the database.
  // A middleware is setup in the route file to check the request body for two required fields: name and price.
  // At this point, the request body should at least have a name and price field.
  try {
    const prevSeqNum = await collections.tour?.findOneAndUpdate(
      {
        bookkeeping: {
          $exists: true,
        },
      },
      {
        $inc: {
          bookkeeping: 1,
        },
      }
    );

    if (prevSeqNum == undefined || prevSeqNum.value == undefined) {
      throw error('Database bookkeeping error.');
    }

    const newTour: Tour = {
      tour_id: prevSeqNum.value.bookkeeping + 1,
      name: req.body.name,
      price: req.body.price,
      rating: req.body.rating ? req.body.rating : null,
    };

    const queryDoc = {
      name: req.body.name,
    };
    const updateDoc = {
      $set: newTour,
    };
    const upsertOpt = {
      upsert: true,
    };

    const result = await collections.tour?.updateOne(
      queryDoc,
      updateDoc,
      upsertOpt
    );

    if (!result || !result?.acknowledged) {
      throw error('Cannot create a new tour. Try again later.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
    console.log(req.body);
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.modifyTour = async (req: TourRequest, res: express.Response) => {
  const id = parseInt(req.params.id);

  try {
    const result = await collections.tour?.updateOne(
      { tour_id: id },
      {
        $set: req.body,
      }
    );

    if (!result || !result?.acknowledged) {
      throw new Error('Cannot update. try again later.');
    }

    res.status(202).json({
      status: 'success',
      data: {
        updated: req.body,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Update failed',
      message: err,
    });
  }

  // modify functioin to be implemented
};

exports.deleteTour = async (req: TourRequest, res: express.Response) => {
  const id = parseInt(req.params.id);
  console.log(id);

  const result = await collections.tour?.deleteOne({ tour_id: id });

  if (!result) {
    return res.status(400).json({
      status: 'Bad request',
      message: 'Connection error. Try again later.',
    });
  } else if (result.deletedCount !== 1) {
    return res.status(404).json({
      status: 'Not Found',
      message: 'Items not found.',
    });
  }

  // Successful delete operaton does not return anything.
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.checkBody = (
  req: TourRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing Price or Name.',
    });
  }
  next();
};

exports.purifyData = (
  req: TourRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  let newBody: any = {};
  console.log(typeof req.body.price);
  for (const [k, v] of Object.entries(req.body)) {
    if (k === 'name' && typeof v === 'string') {
      newBody.name = v;
    }
    if (k === 'price' && typeof v === 'number') {
      newBody.price = v;
    }
    if (k === 'rating' && typeof v === 'number') {
      newBody.rating = v;
    }
  }

  req.body = newBody;
  console.log('data purified');
  console.log(req.body);

  next();
};
