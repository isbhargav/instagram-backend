// import User, { IUser } from "../models/User";
// import { NextFunction, Request, Response } from "express";

// export const getUsers = async (req: Request, res: Response) => {
//   console.log("hirt");
//   // Select all no password
//   let users = await User.find().select("-password").lean().exec();

//   users.forEach((user: any) => {
//     user.isFollowing = false;
//     // Get ID of all followers
//     const followers = user.followers?.map((follower: any) =>
//       follower._id.toString()
//     );
//     // Find if current user is follower of this user
//     if (followers?.includes(req.body.id)) {
//       user.isFollowing = true;
//     }
//   });
//   // Remove Current user
//   users = users.filter((user) => user._id.toString() !== req.body.id);
//   res.status(200).json({ success: true, data: users });
// };

// export const getUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const user: any = await User.findOne({
//     username: req.params.username,
//   })
//     .select("-password")
//     .populate({ path: "posts", select: "files commentsCount likesCount" })
//     .populate({ path: "savedPosts", select: "files commentsCount likesCount" })
//     .populate({ path: "followers", select: "avatar username fullname" })
//     .populate({ path: "following", select: "avatar username fullname" })
//     .lean()
//     .exec();
//   if (!user) {
//     return next({
//       message: `The user ${req.params.username} is not found`,
//       statusCode: 404,
//     });
//   }

//   user.isFollowing = false;
//   const followers = user.followers?.map((follower: IUser) =>
//     follower._id.toString()
//   );
//   user.followers?.forEach((follower) => {
//     follower.isFollowing = false;
//     if (req.user.following.includes(follower._id.toString())) {
//       follower.isFollowing = true;
//     }
//   });
//   user.following?.forEach((user: any) => {
//     user.isFollowing = false;
//     if ((req as any).user.following.includes(user._id.toString())) {
//       user.isFollowing = true;
//     }
//   });
//   if (followers.includes(req.b.id)) {
//     user.isFollowing = true;
//   }
//   user.isMe = req.body.id === user._id.toString();

//   res.status(200).json({ success: true, data: user });
// };
