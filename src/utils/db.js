import mongoose from "mongoose";

export const connectToMongoDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log(`Connected to database ${connection.conn[0].name}`);
  } catch (err) {
    console.error(err);
  }
};
