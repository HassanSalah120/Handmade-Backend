const multer = require("multer");
const ApiError = require("../utils/AppError");
const multerOptions = () => {
  
  const multerStorage = multer.memoryStorage();

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError(`Not an image, Please enter only images.`, 400));
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });

  return upload;
};
exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);
exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
