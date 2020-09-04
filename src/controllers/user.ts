import { Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import { authRequest } from "../types";

export const getUsers = async (req: authRequest, res: Response) => {
  console.log("hirt");
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
  const users = await User.find({ username: regex });
  res.status(200).json({ success: true, data: users });
};

export const follow = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
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
    return next({ message: "Provide user to follow", statusCode: 400 });
  }
  //Find user in DB
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
  // only unfollow if the user is following already
  if (user.followers?.includes(req.user?.id)) {
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
  } else {
    return next({ message: "You are already following him", status: 400 });
  }
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
    next(err);
  }
};
