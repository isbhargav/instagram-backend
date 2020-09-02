import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IPost } from "./Post";

export interface IComment extends Document {
  user: IUser["_id"];
  post: IPost["_id"];
  text: string;
  createdAt?: Date;
}

const CommentSchema: Schema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  text: {
    type: String,
    required: [true, "Please enter the comment"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;
