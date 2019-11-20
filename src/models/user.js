const mongoose = require("mongoose");
const shortid = require("shortid");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  _id: {
    type: String,
    default: shortid.generate
  }
});

// userSchema.virtual("log", {
//   ref: "Exercise",
//   localField: "_id",
//   foreignField: "userId"
// });

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.__v;

  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
