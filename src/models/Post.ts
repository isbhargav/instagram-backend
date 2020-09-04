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
  isLiked?: boolean;
  isSaved?: boolean;
  isMine?: boolean;
}

const PostSchema: Schema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
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
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likeCount: {
    type: Number,
    default: 0,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Post = mongoose.model<IPost>("Post", PostSchema);
