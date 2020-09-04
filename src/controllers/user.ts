import { Response, NextFunction } from "express";
import { User, IUser } from "../models/User";
import { authRequest } from "../types";
import { Post } from "../models/Post";

export const getUsers = async (req: authRequest, res: Response) => {
  // Select all no password
  let users = await User.find().select("-password").lean().exec();

  // Addinf isFollowing values
  users.forEach((user: any) => {
    user.isFollowing = false;
    // Get ID of all followers
    const followers = user.followers?.map((follower: any) =>
      follower._id.toString()
    );
    // Find if current user is follower of this user
    if (followers?.includes(req.user?.id)) {
      user.isFollowing = true;
    }
  });
  // Remove Current user
  users = users.filter((user) => user._id.toString() !== req.user?.id);
  res.status(200).json({ success: true, data: users });
};

export const getUser = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  // Fix post not returning
  const user: any = await User.findOne({
    username: req.params.username,
  })
    .select("-password")
    .populate({ path: "posts", select: "files commentsCount likesCount" })
    .populate({ path: "savedPosts", select: "files commentsCount likesCount" })
    .populate({ path: "followers", select: "avatar username fullname" })
    .populate({ path: "following", select: "avatar username fullname" })
    .lean()
    .exec();

  if (!user) {
    return next({
      message: `The user ${req.params.username} is not found`,
      statusCode: 404,
    });
  }

  user.isFollowing = false;
  const followers = user.followers?.map((follower: IUser) =>
    follower._id.toString()
  );
  user.followers?.forEach((follower: IUser) => {
    follower.isFollowing = false;
    if (req.user?.following?.includes(follower._id.toString())) {
      follower.isFollowing = true;
    }
  });
  user.following?.forEach((user: any) => {
    user.isFollowing = false;
    if ((req as any).user.following.includes(user._id.toString())) {
      user.isFollowing = true;
    }
  });

  if (followers.includes(req.params.id)) {
    user.isFollowing = true;
  }
  user.isMe = req.params.id === user._id.toString();

  res.status(200).json({ success: true, data: user });
};

export const searchUser = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.query.username) {
    return next({ message: "The username cannot be empty", statusCode: 400 });
  }

  const regex = new RegExp(req.query.username.toString(), "i");
  const users = await User.find({ username: regex }).select("-password");
  res.status(200).json({ success: true, data: users });
};

export const follow = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("following");
  if (!req.params.id) {
    return next({ message: "Provide user to follow", statusCode: 400 });
  }
  //FInd user in DB
  const user = await User.findById(req.params.id);
  //If no User found
  if (!user) {
    return next({
      message: `No user found for id ${req.params.id}`,
      statusCode: 404,
    });
  }
  //Check self loop
  if (req.params.id === req.user?.id) {
    return next({
      message: "You can't unfollow/follow yourself",
      status: 400,
    });
  }
  // only follow if the user is not following already
  if (user.followers?.includes(req.user?.id)) {
    return next({ message: "You are already following him", status: 400 });
  }
  console.log("heere");
  // update followers of the req user
  await User.findByIdAndUpdate(req.params.id, {
    $push: { followers: req.user?.id },
    $inc: { followersCount: 1 },
  });
  // update following of curr user
  await User.findByIdAndUpdate(req.user?.id, {
    $push: { following: req.params.id },
    $inc: { followingCount: 1 },
  });

  res.status(200).json({ success: true, data: {} });
};

export const unfollow = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id) {
    return next({ message: "Provide user to unfollow", statusCode: 400 });
  }
  //Find user in DB
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for ID ${req.params.id}`,
      statusCode: 404,
    });
  }

  // make the sure the user is not the logged in user
  if (req.params.id === req.user?.id) {
    return next({ message: "You can't follow/unfollow yourself", status: 400 });
  }
  if (!user.followers?.includes(req.user?.id)) {
    return next({ message: "You are not following this user", status: 400 });
  }
  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user?.id },
    $inc: { followersCount: -1 },
  });
  await User.findByIdAndUpdate(req.user?.id, {
    $pull: { following: req.params.id as Partial<String> },
    $inc: { followingCount: -1 },
  });

  res.status(200).json({ success: true, data: {} });
};

export const editUser = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  // get data
  const { fullname, username, email, website, bio, avatar } = req.body;

  let newDetails: IUser = req.user!!;
  if (fullname) newDetails.fullname = fullname;
  if (username) newDetails.username = username;
  if (email) newDetails.email = email;
  if (website) newDetails.website = website;
  if (bio) newDetails.bio = bio;
  if (avatar) newDetails.avatar = avatar;

  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: { ...newDetails } },
      {
        new: true,
        runValidators: true,
      }
    ).select("fullname username email website bio avatar");
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};
export const feed = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  // get all following user's Ids
  const following = req.user?.following;

  // get all ther following users
  const users = await User.find()
    .where("_id")
    .in(following?.concat([req.user?._id])!!)
    .exec();

  // get posts of following users
  let postIds: any = users.map((user) => user.posts);
  postIds = postIds.flat();

  //populate post with comment and likes and users
  const posts = await Post.find()
    .populate({
      path: "comments",
      select: "text",
      populate: {
        path: "user",
        select: "avatar fullname username",
      },
    })
    .populate({
      path: "user",
      select: "avatar fullname username",
    })
    .sort("-createdAt")
    .where("_id")
    .in(postIds)
    .lean()
    .exec();

  posts.forEach((post) => {
    // is the loggedin user liked the post
    post.isLiked = false;
    const likes = post.likes?.map((like) => like.toString());
    if (likes?.includes(req.user?.id)) {
      post.isLiked = true;
    }

    // is the loggedin saved this post
    post.isSaved = false;
    const savedPosts = req.user?.savedPosts?.map((post) => post.toString());
    if (savedPosts?.includes(post._id)) {
      post.isSaved = true;
    }

    // is the post belongs to the loggedin user
    post.isMine = false;
    if (post.user._id.toString() === req.user?.id) {
      post.isMine = true;
    }
    // is the comment belongs to the loggedin user
    post.comments?.map((comment) => {
      comment.isCommentMine = false;
      if (comment.user._id.toString() === req.user?.id) {
        comment.isCommentMine = true;
      }
    });
  });
  res.status(200).json({ success: true, data: posts });
};
