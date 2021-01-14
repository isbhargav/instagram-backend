import { Router } from "express";
import { protect } from "../middlewares/auth";
import {
  createPost,
  getPosts,
  searchPost,
  getPost,
  deletePost,
  addComment,
} from "../controllers/post";
const postRouter = Router();

postRouter.get("/", getPosts);
postRouter.post("/", protect, createPost);
postRouter.get("/:id/find", protect, getPost); // get post by id
postRouter.get("/search", searchPost); //Search Post by caption or Tag
postRouter.delete("/:id", protect, deletePost); // delete post by id
postRouter.post("/:id/comment", protect, addComment); // add comment to post:id
// postRouter.delete("/:id", protect, deletePost); // delete post by id

export default postRouter;
