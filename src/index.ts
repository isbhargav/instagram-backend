import express from "express";
import { connectToMongoDB } from "./utils/db";
import { config } from "dotenv";
// import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import { errorHandler } from "./middlewares/errorHandler";
import userRouter from "./routes/user";
config();

const app = express();
connectToMongoDB(process.env.MONGO_URI!!);
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use(errorHandler);
app.listen(5000, () => console.log("Express Server is up"));
