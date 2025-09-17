const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function testValidation() {
  try {
    console.log("🚀 开始测试 Zod 数据验证...\n");

    // 1. 测试登录验证 - 成功案例
    console.log("1. 测试登录验证 - 成功案例...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
        username: "admin",
        password: "admin123",
      });
      console.log("✅ 登录成功");
    } catch (error) {
      console.log(
        "❌ 登录失败:",
        error.response?.data?.message || error.message
      );
    }

    // 2. 测试登录验证 - 失败案例（缺少密码）
    console.log("\n2. 测试登录验证 - 失败案例（缺少密码）...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
        username: "admin",
        // 缺少 password
      });
      console.log("❌ 应该失败但成功了");
    } catch (error) {
      console.log("✅ 验证失败（预期）:", error.response?.data?.message);
    }

    // 3. 测试登录验证 - 失败案例（密码太短）
    console.log("\n3. 测试登录验证 - 失败案例（密码太短）...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
        username: "admin",
        password: "123", // 太短
      });
      console.log("❌ 应该失败但成功了");
    } catch (error) {
      console.log("✅ 验证失败（预期）:", error.response?.data?.message);
    }

    // 4. 测试创建用户验证 - 成功案例
    console.log("\n4. 测试创建用户验证 - 成功案例...");
    try {
      const createResponse = await axios.post(
        `${BASE_URL}/users`,
        {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
          role: "teacher",
          status: "active",
        },
        {
          headers: {
            Authorization: "Bearer your-token-here", // 需要有效的 token
          },
        }
      );
      console.log("✅ 创建用户成功");
    } catch (error) {
      console.log(
        "❌ 创建用户失败:",
        error.response?.data?.message || error.message
      );
    }

    // 5. 测试创建用户验证 - 失败案例（邮箱格式错误）
    console.log("\n5. 测试创建用户验证 - 失败案例（邮箱格式错误）...");
    try {
      const createResponse = await axios.post(
        `${BASE_URL}/users`,
        {
          username: "testuser2",
          email: "invalid-email", // 无效邮箱
          password: "password123",
          role: "teacher",
        },
        {
          headers: {
            Authorization: "Bearer your-token-here",
          },
        }
      );
      console.log("❌ 应该失败但成功了");
    } catch (error) {
      console.log("✅ 验证失败（预期）:", error.response?.data?.message);
    }

    // 6. 测试创建用户验证 - 失败案例（用户名太短）
    console.log("\n6. 测试创建用户验证 - 失败案例（用户名太短）...");
    try {
      const createResponse = await axios.post(
        `${BASE_URL}/users`,
        {
          username: "ab", // 太短
          email: "test2@example.com",
          password: "password123",
          role: "teacher",
        },
        {
          headers: {
            Authorization: "Bearer your-token-here",
          },
        }
      );
      console.log("❌ 应该失败但成功了");
    } catch (error) {
      console.log("✅ 验证失败（预期）:", error.response?.data?.message);
    }

    // 7. 测试搜索验证 - 成功案例
    console.log("\n7. 测试搜索验证 - 成功案例...");
    try {
      const searchResponse = await axios.get(
        `${BASE_URL}/users/search?page=1&pageSize=10`,
        {
          headers: {
            Authorization: "Bearer your-token-here",
          },
        }
      );
      console.log("✅ 搜索成功");
    } catch (error) {
      console.log(
        "❌ 搜索失败:",
        error.response?.data?.message || error.message
      );
    }

    // 8. 测试搜索验证 - 失败案例（页码不是数字）
    console.log("\n8. 测试搜索验证 - 失败案例（页码不是数字）...");
    try {
      const searchResponse = await axios.get(
        `${BASE_URL}/users/search?page=abc&pageSize=10`,
        {
          headers: {
            Authorization: "Bearer your-token-here",
          },
        }
      );
      console.log("❌ 应该失败但成功了");
    } catch (error) {
      console.log("✅ 验证失败（预期）:", error.response?.data?.message);
    }

    // 9. 测试搜索验证 - 失败案例（每页数量超过限制）
    console.log("\n9. 测试搜索验证 - 失败案例（每页数量超过限制）...");
    try {
      const searchResponse = await axios.get(
        `${BASE_URL}/users/search?page=1&pageSize=200`,
        {
          headers: {
            Authorization: "Bearer your-token-here",
          },
        }
      );
      console.log("❌ 应该失败但成功了");
    } catch (error) {
      console.log("✅ 验证失败（预期）:", error.response?.data?.message);
    }

    console.log("\n🎉 Zod 数据验证测试完成！");
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

testValidation();
