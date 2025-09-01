#!/bin/bash

# 树形节点API测试脚本
BASE_URL="http://localhost:5001/api"

echo "=== 树形节点API测试 ==="

# 首先需要登录获取token
echo "1. 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "登录失败，请确保有测试用户"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo "登录成功，获取到token: ${TOKEN:0:20}..."

# 设置认证头
AUTH_HEADER="Authorization: Bearer $TOKEN"

echo -e "\n2. 创建根节点..."
ROOT1_RESPONSE=$(curl -s -X POST "$BASE_URL/tree-nodes" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "测试根节点1",
    "description": "第一个测试根节点",
    "isRoot": true,
    "isLeaf": false
  }')

echo "创建根节点响应: $ROOT1_RESPONSE"

ROOT1_ID=$(echo $ROOT1_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "根节点1 ID: $ROOT1_ID"

echo -e "\n3. 创建第二个根节点..."
ROOT2_RESPONSE=$(curl -s -X POST "$BASE_URL/tree-nodes" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "测试根节点2",
    "description": "第二个测试根节点",
    "isRoot": true,
    "isLeaf": false
  }')

echo "创建第二个根节点响应: $ROOT2_RESPONSE"

echo -e "\n4. 获取所有根节点..."
ROOTS_RESPONSE=$(curl -s -X GET "$BASE_URL/tree-nodes/roots" \
  -H "$AUTH_HEADER")

echo "所有根节点: $ROOTS_RESPONSE"

echo -e "\n5. 创建子节点..."
CHILD_RESPONSE=$(curl -s -X POST "$BASE_URL/tree-nodes" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"name\": \"子节点1-1\",
    \"description\": \"第一个子节点\",
    \"isRoot\": false,
    \"isLeaf\": false,
    \"parentId\": \"$ROOT1_ID\"
  }")

echo "创建子节点响应: $CHILD_RESPONSE"

CHILD_ID=$(echo $CHILD_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "子节点 ID: $CHILD_ID"

echo -e "\n6. 创建叶子节点..."
LEAF_RESPONSE=$(curl -s -X POST "$BASE_URL/tree-nodes" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"name\": \"叶子节点1-1-1\",
    \"description\": \"这是一个叶子节点的描述\",
    \"isRoot\": false,
    \"isLeaf\": true,
    \"parentId\": \"$CHILD_ID\"
  }")

echo "创建叶子节点响应: $LEAF_RESPONSE"

echo -e "\n7. 获取完整树形结构..."
TREE_RESPONSE=$(curl -s -X GET "$BASE_URL/tree-nodes/tree" \
  -H "$AUTH_HEADER")

echo "完整树形结构: $TREE_RESPONSE"

echo -e "\n8. 获取根节点的子树..."
SUBTREE_RESPONSE=$(curl -s -X GET "$BASE_URL/tree-nodes/$ROOT1_ID" \
  -H "$AUTH_HEADER")

echo "根节点子树: $SUBTREE_RESPONSE"

echo -e "\n=== API测试完成 ==="
