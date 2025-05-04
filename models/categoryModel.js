const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      maxLength: 32,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);

/*

{
  "_id": ObjectId,
  "name": String,
  "description": String,
  "sub_categories": [
    {
      "name": String,
      "description": String
    }
  ],
  "created_at": Timestamp,
  "deleted_at": Timestamp
}

*/
