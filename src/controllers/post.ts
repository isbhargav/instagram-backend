import { authRequest } from "src/types";
import { NextFunction, Response } from "express";
import { Post, IPost } from "../models/Post";
import { User } from "../models/User";
import { Comment } from "../models/Comment";

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

export const getPosts = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const posts = await Post.find();

  return res.status(200).json({ succes: true, data: posts });
};

export const searchPost = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  //check caption or tag provided
  if (!req.query.caption && !req.query.tag) {
    return next({
      message: "Please provide caption or tag",
      statusCode: 400,
    });
  }

  let posts: IPost[] = [];

  if (req.query.caption) {
    const regex = new RegExp(req.query.caption.toString(), "i");
    posts = await Post.find({ caption: regex });
  }
  if (req.query.tag) {
    const posts2 = await Post.find({ tags: req.query.tag.toString() });
    posts = posts?.concat(posts2);
  }
  res.status(200).json({ success: true, data: posts });
};

export const getPost = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: "user",
      select: "username avatar",
    })
    .populate({
      path: "comments",
      select: "text",
      populate: {
        path: "user",
        select: "username avatar",
      },
    })
    .lean()
    .exec();

  if (!post) {
    return next({
      statusCode: 404,
      message: `No post found for id ${req.params.id}`,
    });
  }

  // isMine
  post.isMine = post?.user._id === req.user?.id;

  // isLiked
  const likes = post.likes?.map((like) => like.toString());
  post.isLiked = likes?.includes(req.user?.id);

  //isSaved
  const savedPosts = req.user?.savedPosts?.map((post) => post.toString());
  post.isSaved = savedPosts?.includes(req.params.id);

  // Comment isMine
  post?.comments?.forEach((comment) => {
    comment.isCommentMine = false;

    const userStr = comment.user._id.toString();
    if (userStr === req.user?.id) {
      comment.isCommentMine = true;
    }
  });

  res.status(200).json({ success: true, data: post });
};

export const deletePost = () => async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      statusCode: 404,
      message: `No post found for id ${req.params.id}`,
    });
  }

  if (post.user.toString() !== req.user?._id) {
    return next({
      statusCode: 401,
      message: "You are not authorized to delete this post",
    });
  }
  await post.remove();
  res.status(200).json({ success: true, data: {} });
};

export const addComment = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next({
      statusCode: 404,
      message: `No post found for id ${req.params.id}`,
    });
  }
  try {
    let comment = await Comment.create({
      user: req.user?.id,
      post: req.params.id,
      text: req.body.text,
    });
    post?.comments?.push(comment?._id);
    post.commentsCount = post?.commentsCount!! + 1;
    await post.save();
    comment = await comment
      .populate({ path: "user", select: "avatar username fullname" })
      .execPopulate();
    comment.isCommentMine = true;
    res.status(200).json({ success: true, data: comment });
  } catch (err) {
    return next(err);
  }
};
