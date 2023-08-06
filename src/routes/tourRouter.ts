import {
  getAllTours,
  createNewTour,
  getTourById,
  modifyTour,
  deleteTour,
  topFiveQuery,
  getTourStats,
  getMonthlyData,
  getToursNearby,
} from '../controllers/tourController';
import {
  verifyLoginStatus,
  restrictUserRoleTo,
} from '../controllers/authController';
import reviewRouter from './reviewRouter';

const express = require('express');
// Routers
const tourRouter = express.Router();
tourRouter.use('/:tourId/reviews', reviewRouter);
tourRouter.use('/:tourId/reviews/new-review', reviewRouter);

tourRouter.route('/top5').get(verifyLoginStatus, topFiveQuery, getAllTours);
tourRouter.route('/tour-stats').get(verifyLoginStatus, getTourStats);
tourRouter.route('/monthly-data/:year?').get(verifyLoginStatus, getMonthlyData);
tourRouter
  .route('/tours-nearby/:distance/center/:cordinates/unit/:unit')
  .get(verifyLoginStatus, getToursNearby);

tourRouter
  .route('/:id')
  .get(getTourById)
  .patch(
    verifyLoginStatus,
    restrictUserRoleTo('admin', 'lead-guide'),
    modifyTour
  )
  .delete(
    verifyLoginStatus,
    restrictUserRoleTo('admin', 'lead-guide'),
    deleteTour
  );

tourRouter
  .route('/')
  .get(getAllTours)
  .post(
    verifyLoginStatus,
    restrictUserRoleTo('admin', 'lead-guide'),
    createNewTour
  );

export default tourRouter;
