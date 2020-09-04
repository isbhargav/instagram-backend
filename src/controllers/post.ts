import { authRequest } from "src/types";
import { NextFunction, Response } from "express";
import { Post } from "../models/Post";
import { User } from "../models/User";

export const createPost = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const { caption, files, tags } = req.body;
  const user = req.user?.id;

  try {
    let post = await Post.create({ caption, files, tags, user });

    // add post in user
    await User.findByIdAndUpdate(user, {
      $push: {
        posts: post._id,
      },
      $inc: {
        postCount: 1,
      },
    });

    post = await post
      .populate({ path: "user", select: "avatar username fullname" })
      .execPopulate();

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};
