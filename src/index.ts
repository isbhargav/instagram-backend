import express from "express";
// import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import User from "./models/User";

const main = async () => {
  const app = express();
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/insta", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log(`Connected to database ${conn.connections[0].name}`);
  } catch (err) {
    console.error(err);
  }

  app.listen(4000, () => console.log("Express Server is up"));
};
main();
