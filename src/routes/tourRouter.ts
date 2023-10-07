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
  getDistancesToTours,
  mostPopular,
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

tourRouter.route('/top5').get(topFiveQuery, getAllTours);
tourRouter.route('/popular').get(mostPopular, getAllTours);
tourRouter.route('/tour-stats').get(verifyLoginStatus, getTourStats);
tourRouter.route('/monthly-data/:year?').get(verifyLoginStatus, getMonthlyData);
tourRouter
  .route('/tours-nearby/:distance/center/:coordinates/unit/:unit')
  .get(verifyLoginStatus, getToursNearby);
tourRouter.route('/distances/:coordinates/unit/:unit').get(getDistancesToTours);

tourRouter
  .route('/:id')
  .get(getTourById)
  .patch(
    verifyLoginStatus,
    restrictUserRoleTo('admin', 'lead-guide'),
    modifyTour,
  )
  .delete(
    verifyLoginStatus,
    restrictUserRoleTo('admin', 'lead-guide'),
    deleteTour,
  );

tourRouter
  .route('/')
  .get(getAllTours)
  .post(
    verifyLoginStatus,
    restrictUserRoleTo('admin', 'lead-guide'),
    createNewTour,
  );

export default tourRouter;
