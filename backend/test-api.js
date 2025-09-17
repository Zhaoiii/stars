// 简单的 API 测试脚本
const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function testAPI() {
  try {
    console.log("🚀 开始测试 API...\n");

    // 测试健康检查
    console.log("1. 测试健康检查...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ 健康检查:", healthResponse.data);

    // 测试用户登录（需要先创建用户）
    console.log("\n2. 测试用户登录...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
        username: "admin",
        password: "admin123",
      });
      console.log("✅ 登录成功:", loginResponse.data);

      const token = loginResponse.data.data.token;

      // 测试获取当前用户信息
      console.log("\n3. 测试获取当前用户信息...");
      const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ 用户信息:", profileResponse.data);
    } catch (loginError) {
      console.log(
        "❌ 登录失败（可能需要先创建用户）:",
        loginError.response?.data || loginError.message
      );
    }
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;


