import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import customEnv from "custom-env";
// eslint-disable-next-line import/no-nodejs-modules
import path from "path";
import Users from "./Models/Users.mjs";

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

app.get("/api/exercise/users", (req, res) => {
  Users.find({}, (error, users) => {
    res.json(users);
  });
});

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
