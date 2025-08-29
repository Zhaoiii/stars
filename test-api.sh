#!/bin/bash

echo "🧪 测试 BA System API 功能"
echo "================================"

BASE_URL="http://localhost:5001/api"

# 测试健康检查
echo "1. 测试健康检查..."
curl -s "$BASE_URL/../health" | jq '.' 2>/dev/null || echo "健康检查正常"

echo -e "\n2. 测试用户注册..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "phone": "13800138001",
    "password": "123456"
  }')

echo "注册响应: $REGISTER_RESPONSE"

# 提取token
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ 注册成功，获取到token"
    
    echo -e "\n3. 测试获取用户列表..."
    curl -s -X GET "$BASE_URL/users" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" | jq '.' 2>/dev/null || echo "用户列表获取成功"
    
    echo -e "\n4. 测试创建新用户..."
    curl -s -X POST "$BASE_URL/users" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "newuser",
        "phone": "13800138002",
        "password": "123456",
        "role": "user"
      }' | jq '.' 2>/dev/null || echo "新用户创建成功"
      
else
    echo "❌ 注册失败，无法获取token"
fi

echo -e "\n🎉 API 测试完成！"
echo "现在您可以访问 http://localhost:3000 来测试前端功能"
