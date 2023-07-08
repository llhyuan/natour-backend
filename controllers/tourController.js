const fs = require('fs');
const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

exports.getAllTours = (req, res) => {
  console.log('next step.');
  console.log(req.timeofRequest);
  res.status(200).send({
    status: 'success',
    time: req.timeofRequest,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getTourById = (req, res) => {
  console.log(req.params.id);

  const tour = tours.find((tour) => tour.id === parseInt(req.params.id));
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};

exports.createNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = {
    ...req.body,
    id: newId,
  };

  tours.push(newTour);
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      if (err) {
        res.status(500).send('Filed. Try again later.');
      } else {
        res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });
      }
    }
  );
  console.log(req.body);
};

exports.modifyTour = (req, res) => {
  console.log(req.params.id);
  console.log(req.body);

  const tour = tours.find((tour) => tour.id === parseInt(req.params.id));

  res.status(202).json({
    status: 'success',
    data: {
      tour: 'send back updated tour',
    },
  });
};

exports.checkId = (req, res, next, id) => {
  if (parseInt(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
};

exports.checkBody = (req, res, next)=>{
  if (!req.body.name || !req.body.price){
    return res.status(400).json({
      'status': 'fail',
      'message': 'Missing Price or Name.'
    })
  }
  next();

}
