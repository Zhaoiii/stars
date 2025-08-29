import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/ba-system";

    await mongoose.connect(mongoURI);

    console.log("MongoDB连接成功");
  } catch (error) {
    console.error("MongoDB连接失败:", (error as Error).message);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB连接已断开");
  } catch (error) {
    console.error("断开MongoDB连接失败:", (error as Error).message);
  }
};
