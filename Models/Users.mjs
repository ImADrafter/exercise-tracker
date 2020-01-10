import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Exercise = new Schema({
  description: String,
  duration: Number,
  date: Date
});

const Users = new Schema({
  username: String,
  exercises: [Exercise]
});

const UserModel = mongoose.model("Users", Users);

export default UserModel;
