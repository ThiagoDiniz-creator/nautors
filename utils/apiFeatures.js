// This class will hold all the code that is common in API get requests
// such as filtering, sorting, desired fields, and pagination.
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Simple filtering
    // Getting the query
    const queryObj = { ...this.queryString };

    // Removing sort, page, fields and limit
    const invalidFields = ['sort', 'limit', 'fields', 'page'];
    invalidFields.forEach((op) => delete queryObj[op]);

    // 1B) Advanced filtering: Allow the client to find only the desired results.
    const queryString = JSON.stringify(this.queryString);

    // As queries no MongoDB são escritas por padrão como: {}
    const parsedQueryString = queryString.replace(
      /\bgte|gt|lt|lte\b/g,
      (match) => `$${match}`
    );
    const parsedQueryObj = JSON.parse(parsedQueryString);
    this.query.find(parsedQueryObj);

    // Return for chaining
    return this;
  }

  sort() {
    // 2) Sorting: Receive the data in the desired order.
    if (this.queryString.sort) {
      // The sorting feature in MongoDB works with the sort property, that will receive the name of the desired
      // fields: {sort: field1, field2}. We can add how many fields we want, and the sorting order will be
      // the first field, to the last field. If there is a 'draw' with the field1 sorting, it will sort between
      // these documents with field2, and so on. To make the sorting decrescent we can add a - before the field:
      // {sort: -field1, field2}.
      const sortBy = this.queryString.sort.replace(/,/g, ' ');
      this.query.sort(sortBy);
    } else this.query.sort('-createdAt');

    // Return for chaining
    return this;
  }

  fields() {
    // 3) Fields: Only receive the desired fields.
    if (this.queryString.fields) {
      const allowedFields = this.queryString.fields.replace(/,/g, ' ');
      this.query.select(allowedFields);
    } else {
      this.query.select('-__v');
    }

    // Return for chaining
    return this;
  }

  paginate() {
    // 4) Limit and Page
    const page = this.queryString.page ? this.queryString.page : 1;
    const limit = this.queryString.limit ? this.queryString.limit : 10;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    // Return for chaining
    return this;
  }
}

// EXPORTING
module.exports = APIFeatures;
