// 测试搜索 API 的脚本
const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function testSearchAPI() {
  try {
    console.log("🚀 开始测试搜索 API...\n");

    // 1. 先登录获取 token
    console.log("1. 用户登录...");
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      username: "admin",
      password: "admin123",
    });

    if (!loginResponse.data.success) {
      console.log("❌ 登录失败，需要先创建管理员用户");
      console.log("请运行: yarn init-admin");
      return;
    }

    const token = loginResponse.data.data.token;
    console.log("✅ 登录成功");

    // 设置请求头
    const headers = { Authorization: `Bearer ${token}` };

    // 2. 测试搜索用户（无参数）
    console.log("\n2. 测试搜索用户（无参数）...");
    const searchAllResponse = await axios.get(`${BASE_URL}/users/search`, {
      headers,
    });
    console.log(`✅ 搜索成功，返回 ${searchAllResponse.data.data.length} 个用户`);
    console.log(`   页码: ${searchAllResponse.data.page}`);
    console.log(`   每页数量: ${searchAllResponse.data.pageSize}`);
    console.log(`   总数: ${searchAllResponse.data.total}`);

    // 3. 测试关键词搜索
    console.log("\n3. 测试关键词搜索...");
    const keywordSearchResponse = await axios.get(`${BASE_URL}/users/search`, {
      headers,
      params: { keyword: "admin" },
    });
    console.log(
      `✅ 关键词搜索成功，返回 ${keywordSearchResponse.data.data.length} 个用户`
    );

    // 4. 测试角色筛选
    console.log("\n4. 测试角色筛选...");
    const roleSearchResponse = await axios.get(`${BASE_URL}/users/search`, {
      headers,
      params: { role: "admin" },
    });
    console.log(
      `✅ 角色筛选成功，返回 ${roleSearchResponse.data.data.length} 个管理员用户`
    );

    // 5. 测试状态筛选
    console.log("\n5. 测试状态筛选...");
    const statusSearchResponse = await axios.get(`${BASE_URL}/users/search`, {
      headers,
      params: { status: "active" },
    });
    console.log(
      `✅ 状态筛选成功，返回 ${statusSearchResponse.data.data.length} 个活跃用户`
    );

    // 6. 测试分页
    console.log("\n6. 测试分页...");
    const pageSearchResponse = await axios.get(`${BASE_URL}/users/search`, {
      headers,
      params: { page: 1, limit: 5 },
    });
    console.log(`✅ 分页测试成功`);
    console.log(`   页码: ${pageSearchResponse.data.page}`);
    console.log(`   每页数量: ${pageSearchResponse.data.pageSize}`);
    console.log(`   总数: ${pageSearchResponse.data.total}`);

    // 7. 测试组合条件
    console.log("\n7. 测试组合条件...");
    const combinedSearchResponse = await axios.get(`${BASE_URL}/users/search`, {
      headers,
      params: {
        keyword: "admin",
        role: "admin",
        status: "active",
        page: 1,
        limit: 10,
      },
    });
    console.log(
      `✅ 组合条件搜索成功，返回 ${combinedSearchResponse.data.data.length} 个用户`
    );

    console.log("\n🎉 搜索 API 测试完成！");
  } catch (error) {
    console.error("❌ 测试失败:", error.response?.data || error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 解决建议:");
      console.log("1. 确保后端服务正在运行（yarn dev）");
      console.log("2. 确保数据库连接正常");
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testSearchAPI();
}

module.exports = testSearchAPI;
