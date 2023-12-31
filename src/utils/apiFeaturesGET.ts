import Tour from '../models/tour';
import mongoose from 'mongoose';

export default class APIFeaturesGET {
  query: mongoose.Query<any, typeof Tour, {}>;
  queryObj;

  constructor(query: mongoose.Query<any, typeof Tour, {}>, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  find() {
    let queryObj = { ...this.queryObj };

    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, '$$$&');
    queryObj = JSON.parse(queryStr);

    if (queryObj.field === 'name') {
      queryObj.name = { $regex: queryObj.value, $options: 'i' };
    } else if (queryObj.field === 'size') {
      const groupSize = parseInt(String(queryObj.value));
      queryObj.maxGroupSize = { $lte: groupSize };
    } else if (queryObj.field === 'duration') {
      queryObj.duration = { $lte: queryObj.value };
    } else if (queryObj.field === 'description') {
      queryObj.description = { $regex: queryObj.value, $options: 'i' };
    }

    if (queryObj.date) {
      queryObj.startDates = { $elemMatch: { $gte: queryObj.date } };
    }

    if (queryObj.budget && queryObj.budget !== 'undefined') {
      queryObj.price = { $lte: parseInt(queryObj.budget) };
    }

    delete queryObj.field;
    delete queryObj.value;
    delete queryObj.date;
    delete queryObj.budget;

    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      let sortBy = '';
      if (typeof this.queryObj.sort === 'string') {
        sortBy = this.queryObj.sort;
      } else if (typeof this.queryObj.sort === 'object') {
        const queryArr = this.queryObj.sort as string[];
        sortBy = queryArr.join(' ');
      }

      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  filter() {
    // Allow users to query selected fields of a document
    if (this.queryObj.fields) {
      let filterBy: string | string[] = '';
      if (typeof this.queryObj.fields === 'string') {
        filterBy = this.queryObj.fields as string;
      } else if (typeof this.queryObj.fields === 'object') {
        const queryArr = this.queryObj.fields as Array<string>;
        filterBy = queryArr.join(' ');
      }

      this.query = this.query.select(filterBy);
    }
    return this;
  }

  paginization() {
    /// .skip() to skip the specified number of record and
    /// .limit() to limit the number of result returned in one query.
    /// The default page number is 1, ie. the first page
    /// And will be set to the valid number user provided.
    let pageNumber: number | undefined = 1;
    if (typeof this.queryObj.page === 'string') {
      pageNumber = parseInt(this.queryObj.page) || 1;
    }

    let limit: number | undefined = 20;
    if (typeof this.queryObj.limit === 'string') {
      limit = parseInt(this.queryObj.limit) || 20;
    }

    // if the page number provided is bigger than the actual number of pages there are.
    // An error is thrown.
    const skip: number = (pageNumber - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
