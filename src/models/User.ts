import mongoose, { Schema, Document } from "mongoose";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { IPost } from "./Post";

export interface IUser extends Document {
  fullname: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  website?: string;
  followers?: [IUser["_id"]];
  followersCount?: number;
  following?: [IUser["_id"]];
  followingCount?: number;
  posts?: [IPost["_id"]];
  postCount?: number;
  savedPosts?: [IPost["_id"]];
  createdAt?: Date;
  getJwtToken: () => string;
  checkPassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please Enter Fullname"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Please Enter your username"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please Enter your email"],
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please Enter your password"],
    minlength: [6, "Password should be atleast 6 character long"],
    maxlength: [12, "Password should be atmost 12 character long"],
  },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/douy56nkf/image/upload/v1594060920/defaults/txxeacnh3vanuhsemfc8.png",
  },
  bio: String,
  website: String,
  followers: [{ type: Schema.Types.ObjectId }],
  followersCount: {
    type: Number,
    default: 0,
  },
  following: [{ type: Schema.Types.ObjectId }],
  followingCount: {
    type: Number,
    default: 0,
  },
  posts: [{ type: Schema.Types.ObjectId }],
  postCount: {
    type: Number,
    default: 0,
  },
  savedPosts: [{ type: Schema.Types.ObjectId }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
UserSchema.pre<IUser>("save", async function (next) {
  const hashedPassword = await argon2.hash(this.password);
  this.password = hashedPassword;
  next();
});
UserSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!!, {
    expiresIn: 1000 * 60 * 60 * 24 * 3,
  });
};
UserSchema.methods.checkPassword = async function (password: string) {
  return argon2.verify(this.password, password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
