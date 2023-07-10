import {
  getAllTours,
  createNewTour,
  getTourById,
  modifyTour,
  deleteTour,
} from '../controllers/tourController';

const express = require('express');
// Routers
const tourRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createNewTour);

tourRouter.route('/:id').get(getTourById).patch(modifyTour).delete(deleteTour);

export default tourRouter;
