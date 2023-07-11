import {
  getAllTours,
  createNewTour,
  getTourById,
  modifyTour,
  deleteTour,
  topFiveQuery,
  getTourStats,
  getMonthlyData,
} from '../controllers/tourController';

const express = require('express');
// Routers
const tourRouter = express.Router();

tourRouter.route('/top5').get(topFiveQuery, getAllTours);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-data/:year?').get(getMonthlyData);

tourRouter
  .route('/details/:id')
  .get(getTourById)
  .patch(modifyTour)
  .delete(deleteTour);

tourRouter.route('/').get(getAllTours).post(createNewTour);

export default tourRouter;
