// MODULES
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const filter = require('../utils/filterObj');
const APIFeatures = require('../utils/apiFeatures');

// Create
module.exports.createOne = (model, desiredFields = []) =>
  catchAsync(async (req, res, next) => {
    // 1) Filter the not required data.
    let filteredData = req.body;
    if (desiredFields.length > 0) {
      filteredData = filter(filteredData, desiredFields);
    }

    // 2) Create the new document.
    const newDoc = await model.create(filteredData);

    // 3) Return the new create document.
    res.status(201).json({ status: 'success', data: newDoc });
  });

// Get one
module.exports.getOne = (model, populateConfig = undefined) =>
  catchAsync(async (req, res, next) => {
    // 1) Check for the ID.
    const { id } = req.params;
    if (!id) {
      return next(
        new AppError(
          `To retrieve only one ${model.modeName} document you need to provide an ID!`,
          400
        )
      );
    }

    // 2) Create the query.
    const query = model.findById(id);

    if (populateConfig) {
      query.populate(populateConfig);
    }

    // 3) Execute the query.
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          `Couldn't find any ${model.modelName} document with the desired ID! Try again with another one.`,
          404
        )
      );
    }

    // 4) Send the result to the client.
    res.status(200).json({ status: 'success', data: doc });
  });

// Get many
module.exports.getMany = (model) =>
  catchAsync(async (req, res, next) => {
    // 1) Creating the APIFeatures obj
    const filterObj = new APIFeatures(model.find(), req.query);

    // 2) Doing the common sorting, filtering, field selection and pagination.
    filterObj.filter().fields().sort().paginate();

    // 3) Executing the query.
    const docs = await filterObj.query;

    // 3) Returning the query.
    res
      .status(200)
      .json({ status: 'success', results: docs.length, data: docs });
  });

// Update
module.exports.updateOne = (model, desiredFields = []) =>
  catchAsync(async (req, res, next) => {
    // 1) Check for the ID.
    const { id } = req.params;
    if (!id) {
      return next(
        new AppError(`Can't update a ${model.modelName} without an ID!`)
      );
    }

    // 2) Filter the data.
    let filteredData = req.body;
    if (desiredFields.length > 0) {
      filteredData = filter(filteredData, desiredFields);
    }

    // 3) Try to update the document.
    const updatedDoc = await model.findByIdAndUpdate(id, filteredData, {
      returnDocument: 'after',
      runValidators: true,
      context: 'query',
    });

    // 4) Check the returned doc.
    if (updatedDoc === null) {
      return next(new AppError('Could not find the required document!', 404));
    }

    // 5) Send the updated doc back, and the success message.
    res.status(200).json({ status: 'message', data: updatedDoc });
  });

// Delete
module.exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const { modelName: name } = model;

    // 1) Getting the id.
    const { id } = req.params;

    // 2) Trying to delete the document.
    const doc = await model.findByIdAndDelete(id);

    // 3) Checking if the delete wasn't successful.
    if (!doc) {
      return next(
        new AppError(
          `Invalid ${name} ID. Could not find any ${name} with this ID.`,
          404
        )
      );
    }

    // 4) Returning the successfully deleted response.
    res.status(204).json({
      status: 'success',
      data: doc,
    });
  });
