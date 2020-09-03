import express from "express";
import { connectToMongoDB } from "./utils/db";
import { config } from "dotenv";
config();

const main = async () => {
  try {
    const app = express();
    connectToMongoDB(process.env.MONGO_URI);

    app.listen(5000, () => console.log("Express Server is up"));
  } catch (err) {
    console.error(err);
  }
};
main();
