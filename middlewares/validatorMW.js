const { validationResult } = require("express-validator");

module.exports = (req, res, nxt) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    nxt();
  }
};
