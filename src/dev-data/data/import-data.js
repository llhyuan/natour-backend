const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourjs');

// Path can be left out if the config file is at the root level of the project.
dotenv.config({ path: './config.env' });
const uri = process.env.DB_CONN_STRING ? process.env.DB_CONN_STRING : '';

mongoose.connect(uri).then(() => {
  console.log('connected to the database.');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
console.log(tours);

// import data
async function importData() {
  try {
    await Tour.create(tours);
    console.log('Data loaded');
  } catch (err) {
    console.log(err);
  }

  process.exit();
}

async function deleteAllData() {
  try {
    await Tour.deleteMany();
    console.log('All data deleted');
  } catch (err) {
    console.log(err);
  }

  process.exit();
}

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
