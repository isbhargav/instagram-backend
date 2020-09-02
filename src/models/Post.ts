import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IComment } from "./Comment";

export interface IPost extends Document {
  user: IUser["_id"];
  caption: string;
  tags?: string[];
  files?: string[];
  likes?: [IUser["_id"]];
  likeCount?: number;
  comments?: [IComment["_id"]];
  commentsCount?: number;
  createdAt?: Date;
}

const PostSchema: Schema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  caption: {
    type: String,
    required: [true, "Please enter the Caption"],
    trim: true,
  },

  tags: [String],
  files: {
    type: [String],
    validate: (v: string[]) => v === null || v.length > 0,
  },
  likes: [{ type: Schema.Types.ObjectId }],
  likeCount: {
    type: Number,
    default: 0,
  },
  comments: [{ type: Schema.Types.ObjectId }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Post = mongoose.model<IPost>("Post", PostSchema);
export default Post;
