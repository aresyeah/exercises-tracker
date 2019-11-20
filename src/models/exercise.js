const mongoose = require("mongoose");
const shortid = require("shortid");

const exerciseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  userId: {
    type: String,
    required: true
    // ref: "User"
  },
  username: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date
  }
});

exerciseSchema.methods.toJSON = function() {
  const exercise = this;
  const exerciseObject = exercise.toObject();

  exerciseObject._id = exerciseObject.userId;
  exerciseObject.date = exerciseObject.date.toISOString().slice(0, 10);

  delete exerciseObject.userId;

  return exerciseObject;
};

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
