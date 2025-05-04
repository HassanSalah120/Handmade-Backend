const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const ApiFeatures = require("../utils/ApiFeatures");

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res, nxt) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // const subCategories = await Subcategory.find(req.filterObj)
    const apiFeature = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .fieldsLimit()
      .search(modelName)
      .sort();

    const countDocuments = await Model.countDocuments();

    // Apply pagination
    await apiFeature.paginate(countDocuments);
    // Execute Query
    const { mongooseQuery, paginationResult } = apiFeature;
    const doc = await mongooseQuery;

    res.status(200).json({
      status: "Success",
      results: doc.length,
      paginationResult,
      data: doc,
    });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, nxt) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      data: newDoc,
    });
  });

exports.getOne = (Model, popOptions) =>
  asyncHandler(async (req, res, nxt) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return nxt(new AppError(`No document found with that ID :${id}`, 404));
    }
    res.status(200).json({
      status: "Success",
      data: doc,
    });
  });
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, nxt) => {
    const { id } = req.params;
    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!document) {
      return nxt(new AppError(`No document found with that ID :${id}`, 404));
    }

    res.status(200).json({ status: "Success", data: document });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, nxt) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return nxt(new AppError(`No document found with that ID :${id}`, 404));
    }
    res.status(204).send();
  });
