import {
  getAllTours,
  createNewTour,
  getTourById,
  modifyTour,
  deleteTour,
  topFiveQuery,
} from '../controllers/tourController';

const express = require('express');
// Routers
const tourRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createNewTour);
tourRouter.route('/top5').get(topFiveQuery, getAllTours);

tourRouter
  .route('/details/:id')
  .get(getTourById)
  .patch(modifyTour)
  .delete(deleteTour);

export default tourRouter;
