import { Router } from "express";
import { protect } from "../middlewares/auth";
import {
  getUsers,
  getUser,
  searchUser,
  follow,
  unfollow,
  editUser,
  feed,
} from "../controllers/user";
const userRouter = Router();

// Get users
userRouter.get("/search", searchUser);
userRouter.get("/", protect, getUsers);
userRouter.put("/", protect, editUser);
userRouter.get("/:username", protect, getUser);
userRouter.get("/:id/unfollow", protect, unfollow);
userRouter.get("/:id/follow", protect, follow);
userRouter.get("/feed", protect, feed);

export default userRouter;
