import { Router } from "express";
import { protect } from "../middlewares/auth";
import {
  getUsers,
  getUser,
  searchUser,
  follow,
  unfollow,
} from "../controllers/user";
const userRouter = Router();

// Get users
userRouter.get("/", protect, getUsers);
userRouter.get("/:username", protect, getUser);
userRouter.get("/search", protect, searchUser);
userRouter.get("/:id/follow", protect, follow);
userRouter.get("/:id/unfollow", protect, unfollow);

export default userRouter;
