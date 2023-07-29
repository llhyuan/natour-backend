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
import {
  verifyLoginStatus,
  restrictUserRoleTo,
} from '../controllers/authController';

const express = require('express');
// Routers
const tourRouter = express.Router();

tourRouter.route('/top5').get(verifyLoginStatus, topFiveQuery, getAllTours);
tourRouter.route('/tour-stats').get(verifyLoginStatus, getTourStats);
tourRouter.route('/monthly-data/:year?').get(verifyLoginStatus, getMonthlyData);

tourRouter
  .route('/details/:id')
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

tourRouter.route('/').get(getAllTours).post(createNewTour);

export default tourRouter;
