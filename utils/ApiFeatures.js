module.exports = class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludedFields = ["page", "limit", "sort", "keyword", "fields"];
    excludedFields.forEach((el) => delete queryStringObj[el]);

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  fieldsLimit() {
    if (this.queryString.fields) {
      const fieldsLimit = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fieldsLimit);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }

    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      const keyword = this.queryString.keyword;
      if (modelName == "Product") {
        query.$or = [
          { title: { $regex: `\\b${keyword}\\b`, $options: "i" } },
          { description: { $regex: `\\b${keyword}\\b`, $options: "i" } },
          { materials: { $regex: `\\b${keyword}\\b`, $options: "i" } },
          { colors: { $regex: `\\b${keyword}\\b`, $options: "i" } },
        ];
      } else {
        query = { name: { $regex: keyword, $options: "i" } };
      }
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    return this.mongooseQuery.model
      .countDocuments(this.mongooseQuery.getFilter())
      .then((countDocuments) => {
        const pagination = {};
        pagination.currentPage = page;
        pagination.limit = limit;
        pagination.numberOfPages = Math.ceil(countDocuments / limit);

        if (skip + limit < countDocuments) {
          pagination.next = page + 1;
        }
        if (skip > 0) {
          pagination.prev = page - 1;
        }

        this.paginationResult = pagination;

        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        return this;
      });
  }
};
