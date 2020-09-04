import { Router } from "express";
import { signup, login, me } from "../controllers/auth";
import { protect } from "../middlewares/auth";
const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", protect, me);
export default authRouter;
