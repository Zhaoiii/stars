import mongoose from "mongoose";
import AssistanceType from "../models/AssistanceType";

const assistanceTypes = [
  {
    name: "手势辅助",
    code: "GESTURE",
    description: "通过手势进行辅助",
    sortOrder: 1,
  },
  {
    name: "身体辅助",
    code: "PHYSICAL",
    description: "通过身体接触进行辅助",
    sortOrder: 2,
  },
  {
    name: "视觉辅助",
    code: "VISION",
    description: "通过视觉提示进行辅助",
    sortOrder: 3,
  },
  {
    name: "语言辅助",
    code: "VERBAL",
    description: "通过语言提示进行辅助",
    sortOrder: 4,
  },
];

async function initAssistanceTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ba-system");
    console.log("Connected to MongoDB");

    // 清空现有数据
    // await AssistanceType.deleteMany({});
    // console.log("Cleared existing assistance types");

    // 插入初始数据
    const createdTypes = await AssistanceType.insertMany(assistanceTypes);
    console.log(`Created ${createdTypes.length} assistance types:`, 
      createdTypes.map(type => `${type.name} (${type.code})`).join(", "));

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error initializing assistance types:", error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initAssistanceTypes();
}

export default initAssistanceTypes;
