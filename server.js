const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./src/models/user");
const Exercise = require("./src/models/exercise");

mongoose
  .connect(
    "mongodb+srv://testuser:testuser@cluster0-bi7x5.mongodb.net/test?authSource=admin&retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true },
    function() {
      // console.log(mongoose.connection.readyState);
    }
  )
  .catch(error => console.log("error: " + error));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Not found middleware
// app.use((req, res, next) => {
//   return next({ status: 404, message: "not found" });
// });

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

// POST requests
app.post("/api/exercise/new-user", async (req, res) => {
  // res.json(req.body);
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      const newUser = new User({ username: req.body.username });
      await newUser.save();
      res.json(newUser);
    } else {
      res.send("username already taken");
    }
  } catch (e) {
    res.send("Server Error: " + e);
  }
});

app.post("/api/exercise/add", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });

    if (!user) {
      return res.send("unknown _id");
    }

    const currentDate = new Date();

    const exercise = new Exercise({
      userId: user._id,
      username: user.username,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date === "" ? currentDate : req.body.date
    });

    res.send(exercise);
    exercise.save();
  } catch (e) {
    res.send("Server Error: " + e);
  }
});

// GET requests
app.get("/api/exercise/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.send("Server Error: " + e);
  }
});

app.get("/api/exercise/log", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.query.userId });

    if (!user) {
      return res.send("unknown userId");
    }

    const exercises = await Exercise.find({
      userId: user._id,
      date: {
        $gte: req.query.from || "0001-01-01",
        $lte: req.query.to || "9999-12-31"
      }
    });

    const displayExercisesCount =
      req.query.limit === undefined
        ? exercises.length
        : req.query.limit > exercises.length
        ? exercises.length
        : req.query.limit;
    const displayExercises = exercises.slice(0, displayExercisesCount);

    res.json({
      _id: user._id,
      username: user.username,
      count: displayExercisesCount,
      log: displayExercises
    });
  } catch (e) {
    res.send("Server Error: " + e);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
