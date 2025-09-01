# 树形节点 API 文档

## 概述

树形节点管理系统提供了完整的树形结构增删改查功能，支持层级关系管理、同级排序和前级/后级节点关联。

## 数据模型

### TreeNode 属性

- `_id`: string - 节点 ID（MongoDB ObjectId）
- `name`: string - 节点名称（必填，1-100 字符）
- `description`: string - 节点描述（可选，最多 500 字符）
- `isRoot`: boolean - 是否为根节点
- `isLeaf`: boolean - 是否为叶子节点
- `preLevelNode`: string - 前一个等级节点的 ID（可选）
- `nextLevelNode`: string - 下一个等级节点的 ID（可选，自动管理）
- `index`: number - 同级排序索引
- `parentId`: string - 父节点 ID（可选）
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

### 业务规则

1. 根节点的 `isRoot` 为 `true`，`parentId` 为 `null`
2. 叶子节点的 `isLeaf` 为 `true`，必须有 `description`
3. `preLevelNode` 和 `nextLevelNode` 形成双向关联
4. `index` 用于同级节点排序，从 0 开始

## API 端点

### 1. 获取所有根节点

```
GET /api/tree-nodes/roots
```

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "根节点1",
      "description": "第一个根节点",
      "isRoot": true,
      "isLeaf": false,
      "index": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. 获取完整树形结构

```
GET /api/tree-nodes/tree
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "roots": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "根节点1",
        "isRoot": true,
        "isLeaf": false,
        "index": 0,
        "children": [
          {
            "_id": "507f1f77bcf86cd799439012",
            "name": "子节点1-1",
            "isRoot": false,
            "isLeaf": false,
            "parentId": "507f1f77bcf86cd799439011",
            "index": 0,
            "children": []
          }
        ]
      }
    ],
    "totalCount": 2
  }
}
```

### 3. 根据 ID 获取节点及其子树

```
GET /api/tree-nodes/:id
```

**路径参数：**

- `id`: 节点 ID

**响应示例：**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "根节点1",
    "isRoot": true,
    "isLeaf": false,
    "children": [...]
  }
}
```

### 4. 创建节点

```
POST /api/tree-nodes
```

**请求体：**

```json
{
  "name": "新节点",
  "description": "节点描述",
  "isRoot": false,
  "isLeaf": true,
  "parentId": "507f1f77bcf86cd799439011",
  "preLevelNode": "507f1f77bcf86cd799439012",
  "index": 0
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "新节点",
    "description": "节点描述",
    "isRoot": false,
    "isLeaf": true,
    "parentId": "507f1f77bcf86cd799439011",
    "preLevelNode": "507f1f77bcf86cd799439012",
    "index": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "节点创建成功"
}
```

### 5. 更新节点

```
PUT /api/tree-nodes/:id
```

**路径参数：**

- `id`: 节点 ID

**请求体：**

```json
{
  "name": "更新的节点名称",
  "description": "更新的描述",
  "isLeaf": false,
  "preLevelNode": "507f1f77bcf86cd799439012"
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "更新的节点名称",
    "description": "更新的描述",
    ...
  },
  "message": "节点更新成功"
}
```

### 6. 删除节点

```
DELETE /api/tree-nodes/:id
```

**路径参数：**

- `id`: 节点 ID

**响应示例：**

```json
{
  "success": true,
  "message": "节点删除成功"
}
```

**注意：** 删除节点会递归删除所有子节点，并自动清理相关的前级/后级关联关系。

### 7. 同级节点重新排序

```
POST /api/tree-nodes/reorder
```

**请求体：**

```json
{
  "parentId": "507f1f77bcf86cd799439011",
  "nodeIds": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439014"
  ]
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "节点排序更新成功"
}
```

### 8. 获取可选择的前级节点

```
GET /api/tree-nodes/:id/available-pre-level
```

**路径参数：**

- `id`: 节点 ID

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "兄弟节点1",
      "isLeaf": false,
      "index": 0
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "兄弟节点2",
      "isLeaf": true,
      "index": 2
    }
  ]
}
```

## 错误处理

所有 API 端点都遵循统一的错误响应格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

### 常见错误码

- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 认证

所有 API 端点都需要有效的 JWT 令牌认证。请在请求头中包含：

```
Authorization: Bearer <your-jwt-token>
```

## 使用示例

### 创建完整的树形结构

1. 创建根节点
2. 创建子节点，指定父节点 ID
3. 创建叶子节点，必须包含描述
4. 设置前级/后级关联关系
5. 使用重新排序 API 调整同级顺序

### 查询树形结构

1. 使用 `/tree` 端点获取完整结构
2. 使用 `/:id` 端点获取指定子树
3. 使用 `/roots` 端点仅获取根节点列表

### 维护数据一致性

- 删除节点时自动清理关联关系
- 更新前级节点时自动更新双向关联
- 插入节点时自动调整同级索引
