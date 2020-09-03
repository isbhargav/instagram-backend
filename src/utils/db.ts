import mongoose from "mongoose";

export const connectToMongoDB = async (uri: string) => {
  try {
    const conn = await mongoose.connect(uri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log(`Connected to database ${conn.connections[0].name}`);
  } catch (err) {
    console.error(err);
  }
};
