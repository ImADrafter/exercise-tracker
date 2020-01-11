import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import customEnv from "custom-env";
// eslint-disable-next-line import/no-nodejs-modules
import path from "path";
import Users from "./Models/Users.mjs";
import moment from "moment";

customEnv.env();
mongoose.connect(process.env.MLAB_URI || "mongodb://localhost/exercise-track");

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const rootDir = path.resolve();

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "./views/", "index.html"));
});

app.set("json spaces", 2);

// Get all users
app.get("/api/exercise/users", (req, res) => {
  Users.find({}, (error, users) => {
    res.json(users);
  });
});

// Create new user
app.post("/api/exercise/new-user", (req, res) => {
  const { username } = req.body;

  Users.find({ username }, (error, result) => {
    if (result.length) {
      res.send(`Username ${username} already in use`);
    } else {
      const newUser = new Users({ username });
      newUser.save((error, savedItem) => {
        if (error) {
          console.error(error);
          res.send(error);
        } else {
          res.send(savedItem + "was saved");
        }
      });
    }
  });
});

// If date is not provided, get date atm
const getDateOrNow = date => {
  if (date === "") {
    console.log(moment().format("DD/MM/YYYY"));
    return moment().format("DD/MM/YYYY");
  }
  return date;
};

// Add exercise to user
app.post("/api/exercise/add", (req, res) => {
  const { userId, description, duration, date } = req.body;

  Users.findByIdAndUpdate(
    userId,
    {
      $push: { exercises: { description, duration, date: getDateOrNow(date) } }
    },
    { new: true },
    (error, result) => {
      res.send("User id found" + result);
    }
  );
});

// Get exercise log by _id
app.get("/api/exercise/log", (req, res) => {
  const { userId, from, to, limit } = req.query;
  Users.find({ _id: userId }, (error, result) => {
    if (result.length) {
      const exerciseArray = result[0].exercises;

      const refinedExerciseArray = exerciseArray.map(element => {
        const { description, duration, date } = element;

        const fullObj = {
          description,
          duration,
          date
        };

        if (from) {
          return moment(date).isAfter(from) ? fullObj : undefined;
        }

        if (to) {
          return moment(date).isBefore(to) ? fullObj : undefined;
        }

        return fullObj;
      });

      console.log(exerciseArray);

      res.json(
        refinedExerciseArray.filter(_ => _)
        // + "Total exercise count: " + exerciseArray.length
      );
    }
  });
});

// Not found middleware
app.use((req, res, next) => next({ status: 404, message: "not found" }));

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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
