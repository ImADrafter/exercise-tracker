import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Users = new Schema({
  userName: String,
  userId: String
});

const UserModel = mongoose.model("Users", Users);

export default UserModel;
