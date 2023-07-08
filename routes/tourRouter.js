const express = require('express');
const tourController = require('../controllers/tourController');

// Routers
const tourRouter = express.Router();

tourRouter.param('id', tourController.checkId);

tourRouter.route('/').get(tourController.getAllTours).post(tourController.checkBody ,tourController.createNewTour);

tourRouter.route('/:id').get(tourController.getTourById).patch(tourController.modifyTour);

module.exports = tourRouter;
