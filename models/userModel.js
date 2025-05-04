const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 32,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "artisan", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
      default: "default.jpg",
    },
    Phone: String,
    birthDate: Date,

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        alias: {
          type: String,
        },
        details: {
          type: String,
          required: true,
          minLength: 3,
          maxLength: 50,
        },
        phone: {
          type: String,
          required: true,
        },
        city: { type: String, required: true },
        postalCode: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", function (nxt) {
  if (!this.isModified("password") || this.isNew) return nxt();

  this.passwordChangedAt = Date.now() - 1000;

  nxt();
});

userSchema.pre("save", async function (nxt) {
  if (!this.isModified("password")) return nxt();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  nxt();
});

userSchema.pre(/^find/, function (nxt) {
  this.find({ active: { $ne: false } });
  nxt();
});

userSchema.methods.checkPassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimeStamp < changedTime;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 100;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);

/**
 * 
  {

  "avatar": String,
  "first_name": String,
  "last_name": String,
  "username": String,
  "email": String,
  "password": String,
  "birth_date": Date,
  "phone_number": String,
  "addresses": [
    {
      "title": String,
      "address_line_1": String,
      "address_line_2": String,
      "country": String,
      "city": String,
      "postal_code": String,
      "landmark": String,
      "phone_number": String
    }
  ],
  "wishlist": [ObjectId], // Array of product IDs
  "created_at": Timestamp,
  "deleted_at": Timestamp
}

 */
