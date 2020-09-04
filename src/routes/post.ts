import { Router } from "express";
import { protect } from "../middlewares/auth";
import { createPost } from "../controllers/post";
const postRouter = Router();

postRouter.post("/", protect, createPost);
export default postRouter;
