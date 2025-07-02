import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("DB connection established");
  } catch (e) {
    console.error("DB connection error:", e.message);
    throw e;
  }
};
